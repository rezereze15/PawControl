<?php

namespace Tests\Feature;

use App\Exceptions\MedicalRecordLockedException;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordFile;
use App\Models\MedicalSupply;
use App\Models\Pet;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** The veterinarian's diagnosis form: start, encode, services/supplies, files, shared status. */
class MedicalRecordEncodingTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 9000;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.supabase.url' => 'https://project.supabase.test',
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.medical_files_bucket' => 'medical-files',
        ]);
        Http::fake([
            '*/object/sign/*' => Http::response(['signedURL' => '/object/sign/medical-files/x.png?token=abc']),
            '*' => Http::response(['Key' => 'ok']),
        ]);

        $this->travelTo('2026-11-26 09:00:00');
    }

    private function user(string $role, array $attributes = []): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active', ...$attributes]);
    }

    private function record(?User $owner = null, string $at = '2026-11-26 10:00:00'): MedicalRecord
    {
        $owner ??= $this->user('customer');
        $pet = Pet::create(['petName' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'petOwnerID' => $owner->id]);
        $appointment = Appointment::create([
            'ar_first_name' => 'Jamie', 'ar_last_name' => 'Sample', 'pet_id' => $pet->petID,
            'service_type' => 'Consultation', 'notes' => 'Coughing', 'app_date_time' => $at,
            'reference_number' => (string) $this->reference++, 'status' => Appointment::STATUS_CONFIRMED,
            'user_id' => $owner->id,
        ]);

        return MedicalRecord::forAcceptedAppointment($appointment, null);
    }

    private function supply(string $name, int $stock, bool $active = true): MedicalSupply
    {
        return MedicalSupply::create([
            'name' => $name, 'category' => 'Medication', 'unit_of_measure' => 'pcs',
            'stock_quantity' => $stock, 'reorder_level' => 1, 'unit_price' => 50, 'is_active' => $active,
        ]);
    }

    /** A real 1x1 PNG (fake()->image() needs the GD extension). */
    private function png(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));
    }

    /** @return array<string, mixed> */
    private function form(array $overrides = []): array
    {
        return [
            'diagnosis' => 'Kennel cough',
            'treatment' => 'Doxycycline 5 days',
            'suggestions' => 'Keep away from other dogs for a week',
            'lab_results' => 'CBC normal',
            'vet_notes' => 'Recheck if fever',
            'status' => 'Ongoing',
            'services' => [],
            'supplies' => [],
            ...$overrides,
        ];
    }

    public function test_new_records_start_as_upcoming(): void
    {
        $this->assertSame(MedicalRecord::STATUS_UPCOMING, $this->record()->fresh()->status);
    }

    public function test_select_marks_the_record_as_selected(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();

        $this->actingAs($vet)->post(route('medical-records.select', $record))
            ->assertRedirect()
            ->assertSessionHas('success');

        $record->refresh();
        $this->assertSame(MedicalRecord::STATUS_SELECTED, $record->status);
        $this->assertSame($vet->id, $record->veterinarian_id);
        $this->assertNull($record->started_at);

        // Another vet selecting it afterwards doesn't take it over.
        $this->actingAs($this->user('veterinarian'))->post(route('medical-records.select', $record));
        $this->assertSame($vet->id, $record->fresh()->veterinarian_id);
    }

    public function test_an_upcoming_record_must_be_selected_before_the_diagnosis_starts(): void
    {
        $record = $this->record();

        $this->actingAs($this->user('veterinarian'))->post(route('medical-records.start', $record))->assertRedirect();

        $this->assertSame(MedicalRecord::STATUS_UPCOMING, $record->fresh()->status);
    }

    public function test_start_diagnosis_after_selecting(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();

        $this->actingAs($vet)->post(route('medical-records.select', $record));
        $this->actingAs($vet)->post(route('medical-records.start', $record))->assertRedirect();

        $record->refresh();
        $this->assertSame(MedicalRecord::STATUS_ONGOING, $record->status);
        $this->assertSame($vet->id, $record->veterinarian_id);
        $this->assertTrue($record->started_at->equalTo(now()));

        // Selecting again (or another vet) doesn't restart it.
        $this->travel(5)->minutes();
        $this->actingAs($this->user('veterinarian'))->post(route('medical-records.start', $record));
        $this->assertSame($vet->id, $record->fresh()->veterinarian_id);
        $this->assertTrue($record->fresh()->started_at->equalTo($record->started_at));
    }

    public function test_vet_encodes_findings_services_and_supplies(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();
        $service = Service::create(['name' => 'Deworming', 'price' => 500, 'is_active' => true]);
        $gauze = $this->supply('Gauze', 10);

        $this->actingAs($vet)
            ->put(route('medical-records.update', $record), $this->form([
                'services' => [$service->id],
                'supplies' => [['id' => $gauze->id, 'quantity' => 3]],
            ]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Medical record saved.');

        $record->refresh();
        $this->assertSame('Kennel cough', $record->diagnosis);
        $this->assertSame('Doxycycline 5 days', $record->treatment);
        $this->assertSame('Keep away from other dogs for a week', $record->suggestions);
        $this->assertSame('CBC normal', $record->lab_results);
        $this->assertSame('Recheck if fever', $record->vet_notes);
        $this->assertSame(MedicalRecord::STATUS_ONGOING, $record->status);
        $this->assertSame($vet->id, $record->veterinarian_id);
        $this->assertNull($record->completed_at);

        $this->assertEquals(500, $record->services->sole()->pivot->price);
        $this->assertSame(3, $record->supplies->sole()->pivot->quantity);
        $this->assertSame(7, $gauze->fresh()->stock_quantity);
    }

    public function test_editing_supplies_moves_stock_by_the_difference(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();
        $gauze = $this->supply('Gauze', 10);
        $syringe = $this->supply('Syringe', 5);

        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'supplies' => [['id' => $gauze->id, 'quantity' => 3], ['id' => $syringe->id, 'quantity' => 2]],
        ]))->assertSessionHasNoErrors();
        $this->assertSame([7, 3], [$gauze->fresh()->stock_quantity, $syringe->fresh()->stock_quantity]);

        // 3 → 5 gauze takes 2 more; removing the syringes puts 2 back.
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'supplies' => [['id' => $gauze->id, 'quantity' => 5]],
        ]))->assertSessionHasNoErrors();
        $this->assertSame([5, 5], [$gauze->fresh()->stock_quantity, $syringe->fresh()->stock_quantity]);

        // Saving again with the same amounts changes nothing.
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'supplies' => [['id' => $gauze->id, 'quantity' => 5]],
        ]));
        $this->assertSame(5, $gauze->fresh()->stock_quantity);
    }

    public function test_not_enough_stock_rejects_the_whole_save(): void
    {
        $record = $this->record();
        $gauze = $this->supply('Gauze', 10);
        $vaccine = $this->supply('Test Vaccine', 1);

        $this->actingAs($this->user('veterinarian'))
            ->put(route('medical-records.update', $record), $this->form([
                'diagnosis' => 'Should not be saved',
                'supplies' => [['id' => $gauze->id, 'quantity' => 2], ['id' => $vaccine->id, 'quantity' => 3]],
            ]))
            ->assertSessionHasErrors(['supplies.1.quantity' => 'Only 1 pcs of Test Vaccine left in stock.']);

        $this->assertSame([10, 1], [$gauze->fresh()->stock_quantity, $vaccine->fresh()->stock_quantity]);
        $this->assertNull($record->fresh()->diagnosis);
        $this->assertCount(0, $record->supplies()->get());
    }

    public function test_completing_requires_a_diagnosis_and_records_the_time(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();

        $this->actingAs($vet)
            ->put(route('medical-records.update', $record), $this->form(['status' => 'Completed', 'diagnosis' => ' ']))
            ->assertSessionHasErrors('diagnosis');
        $this->assertSame(MedicalRecord::STATUS_UPCOMING, $record->fresh()->status);

        $this->actingAs($vet)
            ->put(route('medical-records.update', $record), $this->form(['status' => 'Completed']))
            ->assertSessionHas('success', 'Medical record saved and marked as completed.');

        $record->refresh();
        $this->assertSame(MedicalRecord::STATUS_COMPLETED, $record->status);
        $this->assertTrue($record->completed_at->equalTo(now()));
        $this->assertNotNull($record->started_at);
    }

    public function test_completed_records_are_locked(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();
        $gauze = $this->supply('Gauze', 10);
        $file = $record->files()->create([
            'path' => 'records/x.png', 'disk' => 'supabase', 'original_name' => 'x.png', 'mime_type' => 'image/png', 'size' => 10,
        ]);
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'status' => 'Completed',
            'supplies' => [['id' => $gauze->id, 'quantity' => 2]],
        ]))->assertSessionHasNoErrors();
        $this->assertSame(MedicalRecord::STATUS_COMPLETED, $record->fresh()->status);

        // Every write endpoint refuses, even with otherwise valid input.
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'diagnosis' => 'Changed', 'status' => 'Ongoing', 'supplies' => [],
        ]))->assertForbidden();
        $this->actingAs($vet)->post(route('medical-records.select', $record))->assertForbidden();
        $this->actingAs($vet)->post(route('medical-records.start', $record))->assertForbidden();
        $this->actingAs($vet)->post(route('medical-records.files.store', $record), ['file' => $this->png('new.png')])->assertForbidden();
        $this->actingAs($vet)->delete(route('medical-records.files.destroy', [$record, $file]))->assertForbidden();

        $record->refresh();
        $this->assertSame('Kennel cough', $record->diagnosis);
        $this->assertSame(MedicalRecord::STATUS_COMPLETED, $record->status);
        $this->assertSame(2, $record->supplies()->sole()->pivot->quantity);
        $this->assertSame(8, $gauze->fresh()->stock_quantity);
        $this->assertSame(1, $record->files()->count());

        // The model refuses direct changes too.
        $this->expectException(MedicalRecordLockedException::class);
        $record->update(['diagnosis' => 'Tampered']);
    }

    public function test_inactive_services_and_supplies_cannot_be_added_but_existing_ones_are_kept(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();
        $service = Service::create(['name' => 'Old Service', 'price' => 100, 'is_active' => true]);
        $supply = $this->supply('Old Supply', 10);
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'services' => [$service->id], 'supplies' => [['id' => $supply->id, 'quantity' => 1]],
        ]))->assertSessionHasNoErrors();

        $service->update(['is_active' => false, 'price' => 999]);
        $supply->update(['is_active' => false]);
        $newInactive = Service::create(['name' => 'Retired', 'price' => 100, 'is_active' => false]);

        // Already on the record: still allowed, and keeps the price it was charged at.
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'services' => [$service->id], 'supplies' => [['id' => $supply->id, 'quantity' => 1]],
        ]))->assertSessionHasNoErrors();
        $this->assertEquals(100, $record->services()->sole()->pivot->price);

        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'services' => [$newInactive->id],
        ]))->assertSessionHasErrors('services.0');
    }

    public function test_only_veterinarians_can_start_or_encode(): void
    {
        $record = $this->record();

        foreach (['clerk', 'customer', 'owner', 'admin'] as $role) {
            $user = $this->user($role);
            $this->actingAs($user)->post(route('medical-records.select', $record))->assertForbidden();
            $this->actingAs($user)->post(route('medical-records.start', $record))->assertForbidden();
            $this->actingAs($user)->put(route('medical-records.update', $record), $this->form())->assertForbidden();
            $this->actingAs($user)->post(route('medical-records.files.store', $record), [
                'file' => $this->png('xray.png'),
            ])->assertForbidden();
        }

        $this->assertSame(MedicalRecord::STATUS_UPCOMING, $record->fresh()->status);
        $this->assertNull($record->fresh()->diagnosis);
    }

    public function test_vet_uploads_and_removes_medical_files(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();

        $this->actingAs($vet)
            ->post(route('medical-records.files.store', $record), ['file' => $this->png('xray.png')])
            ->assertSessionHasNoErrors();

        $file = MedicalRecordFile::sole();
        $this->assertSame('xray.png', $file->original_name);
        $this->assertSame('image/png', $file->mime_type);
        $this->assertStringStartsWith("records/{$record->id}/", $file->path);
        Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), '/object/medical-files/records/'.$record->id.'/'));

        $this->actingAs($vet)
            ->delete(route('medical-records.files.destroy', [$record, $file]))
            ->assertSessionHasNoErrors();
        $this->assertDatabaseCount('medical_record_files', 0);
    }

    public function test_upload_rejects_wrong_types(): void
    {
        $this->actingAs($this->user('veterinarian'))
            ->post(route('medical-records.files.store', $this->record()), [
                'file' => UploadedFile::fake()->create('notes.exe', 10, 'application/x-msdownload'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount('medical_record_files', 0);
    }

    public function test_files_are_served_only_to_staff_and_the_pets_owner(): void
    {
        $owner = $this->user('customer');
        $record = $this->record($owner);
        $file = $record->files()->create([
            'path' => "records/{$record->id}/a.png", 'disk' => 'supabase', 'original_name' => 'a.png',
            'mime_type' => 'image/png', 'size' => 10,
        ]);
        $url = route('medical-records.files.show', [$record, $file]);

        foreach ([$this->user('veterinarian'), $this->user('clerk'), $this->user('owner'), $owner] as $allowed) {
            $this->actingAs($allowed)->get($url)->assertRedirect();
        }
        foreach ([$this->user('customer'), $this->user('admin')] as $denied) {
            $this->actingAs($denied)->get($url)->assertForbidden();
        }

        // A file can't be fetched through another record's URL.
        $other = $this->record();
        $this->actingAs($owner)->get(route('medical-records.files.show', [$other, $file]))->assertNotFound();
    }

    public function test_status_is_shared_with_vet_clerk_and_clinic_owner(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();
        $this->actingAs($vet)->post(route('medical-records.select', $record));
        $this->actingAs($vet)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('patientRecords.0.status', 'Selected')
                ->where('patientRecords.0.visits.0.recordStatus', 'Selected'));

        $this->actingAs($vet)->post(route('medical-records.start', $record));

        $this->actingAs($vet)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('confirmedAppointments.0.visitStatus', 'Ongoing')
                ->where('confirmedAppointments.0.medicalRecordId', $record->id)
                ->where('patientRecords.0.status', 'Ongoing')
                ->where('patientRecords.0.visits.0.recordStatus', 'Ongoing')
                ->where('patientRecords.0.visits.0.veterinarian', $vet->name)
                ->has('recordOptions.services')
                ->has('recordOptions.supplies'));

        $this->actingAs($this->user('clerk'))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('upcomingAppointments.0.visitStatus', 'Ongoing')
                ->where('patientRecords.0.visits.0.recordStatus', 'Ongoing'));

        $this->actingAs($this->user('owner'))
            ->get(route('dashboard.role', ['role' => 'owner']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('petRecords.0.status', 'Ongoing')
                ->where('petRecords.0.veterinarian', $vet->name)
                ->where('petRecords.0.visits.0.recordStatus', 'Ongoing'));
    }

    public function test_pet_owner_sees_the_encoded_record_of_their_pet(): void
    {
        $owner = $this->user('customer');
        $record = $this->record($owner);
        $this->actingAs($this->user('veterinarian'))->put(route('medical-records.update', $record), $this->form(['status' => 'Completed']));

        $this->actingAs($owner)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('medicalRecords.0.visits.0.diagnosis', 'Kennel cough')
                ->where('medicalRecords.0.visits.0.suggestions', 'Keep away from other dogs for a week')
                ->where('medicalRecords.0.visits.0.recordStatus', 'Completed'));
    }

    public function test_vet_notes_are_never_sent_to_the_pet_owner(): void
    {
        $owner = $this->user('customer');
        $record = $this->record($owner);
        $this->actingAs($this->user('veterinarian'))->put(route('medical-records.update', $record), $this->form(['status' => 'Completed']));

        // The pet's owner gets the findings, but not the clinic's internal notes.
        $this->actingAs($owner)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('medicalRecords.0.visits.0.diagnosis', 'Kennel cough')
                ->missing('medicalRecords.0.visits.0.vetNotes'));

        // Clinic staff still see them.
        foreach (['veterinarian' => 'patientRecords', 'clerk' => 'patientRecords', 'owner' => 'petRecords'] as $role => $prop) {
            $this->actingAs($this->user($role))
                ->get(route('dashboard.role', ['role' => $role]))
                ->assertInertia(fn (Assert $page) => $page->where("{$prop}.0.visits.0.vetNotes", 'Recheck if fever'));
        }
    }

    public function test_clinic_owner_status_comes_from_records(): void
    {
        $record = $this->record(at: '2026-11-20 10:00:00'); // a past visit, never completed
        Pet::create(['petName' => 'NoVisits', 'species' => 'Cat', 'breed' => 'Puspin', 'petOwnerID' => $this->user('customer')->id]);

        $this->actingAs($this->user('owner'))
            ->get(route('dashboard.role', ['role' => 'owner']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('petRecords', fn ($pets) => collect($pets)->pluck('status', 'name')->all() === ['Milo' => 'Upcoming', 'NoVisits' => 'No Visits']));

        $record->update(['status' => MedicalRecord::STATUS_COMPLETED]);

        $this->actingAs($this->user('owner'))
            ->get(route('dashboard.role', ['role' => 'owner']))
            ->assertInertia(fn (Assert $page) => $page->where('petRecords.0.status', 'Completed'));
    }
}
