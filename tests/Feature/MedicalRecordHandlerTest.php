<?php

namespace Tests\Feature;

use App\Exceptions\MedicalRecordTakenException;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\MedicalSupply;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The vet who selects a medical record is the one who handles it: only they can start,
 * save or complete it, or change its files. Other vets can still view it.
 */
class MedicalRecordHandlerTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 9000;

    protected function setUp(): void
    {
        parent::setUp();

        // Files go to Supabase Storage: fake it so no test ever reaches the real bucket.
        config([
            'services.supabase.url' => 'https://project.supabase.test',
            'services.supabase.secret_key' => 'sb_secret_test',
        ]);
        Http::fake(['*' => Http::response(['Key' => 'ok'])]);

        $this->travelTo('2026-11-26 09:00:00');
    }

    public function test_another_vet_cannot_select_or_start_a_record_someone_selected(): void
    {
        $ana = $this->vet('Ana Cruz');
        $ben = $this->vet('Ben Reyes');
        $record = $this->record();

        $this->actingAs($ana)->post(route('medical-records.select', $record))->assertSessionHas('success');

        $this->actingAs($ben)->post(route('medical-records.select', $record))->assertForbidden();
        $this->actingAs($ben)->post(route('medical-records.start', $record))->assertForbidden();

        $record->refresh();
        $this->assertSame(MedicalRecord::STATUS_SELECTED, $record->status);
        $this->assertSame($ana->id, $record->veterinarian_id);
        $this->assertNull($record->started_at);

        // Ana can still start it.
        $this->actingAs($ana)->post(route('medical-records.start', $record))->assertRedirect();
        $this->assertSame(MedicalRecord::STATUS_ONGOING, $record->fresh()->status);
    }

    public function test_another_vet_cannot_save_or_complete_it(): void
    {
        $ana = $this->vet('Ana Cruz');
        $ben = $this->vet('Ben Reyes');
        $record = $this->record();
        $gauze = $this->supply('Gauze', 10);
        $this->actingAs($ana)->post(route('medical-records.select', $record));
        $this->actingAs($ana)->post(route('medical-records.start', $record));

        foreach (['Ongoing', 'Completed'] as $status) {
            $this->actingAs($ben)
                ->put(route('medical-records.update', $record), $this->form([
                    'status' => $status,
                    'supplies' => [['id' => $gauze->id, 'quantity' => 3]],
                ]))
                ->assertForbidden();
        }

        // Refused before validating: a half-filled form gets "not yours", not field errors.
        $this->actingAs($ben)
            ->put(route('medical-records.update', $record), ['status' => 'Completed'])
            ->assertForbidden();

        $record->refresh();
        $this->assertSame(MedicalRecord::STATUS_ONGOING, $record->status);
        $this->assertNull($record->diagnosis);
        $this->assertSame(0, $record->supplies()->count());
        $this->assertSame(10, $gauze->fresh()->stock_quantity, 'Stock is untouched.');

        // Ana's save goes through.
        $this->actingAs($ana)
            ->put(route('medical-records.update', $record), $this->form([
                'supplies' => [['id' => $gauze->id, 'quantity' => 3]],
            ]))
            ->assertSessionHasNoErrors();
        $this->assertSame('Kennel cough', $record->fresh()->diagnosis);
        $this->assertSame(7, $gauze->fresh()->stock_quantity);
    }

    public function test_another_vet_cannot_add_or_remove_its_files(): void
    {
        $ana = $this->vet('Ana Cruz');
        $ben = $this->vet('Ben Reyes');
        $record = $this->record();
        $this->actingAs($ana)->post(route('medical-records.select', $record));
        $file = $record->files()->create([
            'path' => "records/{$record->id}/xray.png", 'disk' => 'supabase', 'original_name' => 'xray.png',
            'mime_type' => 'image/png', 'size' => 10,
        ]);

        $this->actingAs($ben)
            ->post(route('medical-records.files.store', $record), ['file' => $this->png('mine.png')])
            ->assertForbidden();
        $this->actingAs($ben)
            ->delete(route('medical-records.files.destroy', [$record, $file]))
            ->assertForbidden();

        $this->assertSame(['xray.png'], $record->files()->pluck('original_name')->all());
        Http::assertNothingSent();
    }

    public function test_an_unselected_record_belongs_to_the_first_vet_who_saves_it(): void
    {
        $ana = $this->vet('Ana Cruz');
        $ben = $this->vet('Ben Reyes');
        $record = $this->record();

        // Nobody selected it yet, so Ben can save it, and it becomes his.
        $this->actingAs($ben)
            ->put(route('medical-records.update', $record), $this->form())
            ->assertSessionHasNoErrors();
        $this->assertSame($ben->id, $record->fresh()->veterinarian_id);

        $this->actingAs($ana)
            ->put(route('medical-records.update', $record), $this->form(['diagnosis' => 'Changed']))
            ->assertForbidden();
        $this->assertSame('Kennel cough', $record->fresh()->diagnosis);
    }

    public function test_the_message_names_the_vet_who_selected_it(): void
    {
        $ana = $this->vet('Ana Cruz');
        $record = $this->record();
        $record->forceFill(['status' => MedicalRecord::STATUS_SELECTED, 'veterinarian_id' => $ana->id])->save();

        $this->assertSame(
            'This medical record was selected by Dr. Ana Cruz. Only they can work on it.',
            (new MedicalRecordTakenException($record))->getMessage(),
        );
        $this->assertSame(403, (new MedicalRecordTakenException($record))->getStatusCode());

        // No vet name to show: the message still makes sense.
        $this->assertSame(
            'This medical record was selected by another veterinarian. Only they can work on it.',
            (new MedicalRecordTakenException($this->record()))->getMessage(),
        );
    }

    public function test_record_screens_show_which_vet_handles_each_record(): void
    {
        $ana = $this->vet('Ana Cruz');
        $ben = $this->vet('Ben Reyes');
        $record = $this->record();

        // Not selected yet: no vet.
        $this->actingAs($ben)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('patientRecords.0.visits.0.veterinarian', null)
                ->where('patientRecords.0.visits.0.veterinarianId', null));

        $this->actingAs($ana)->post(route('medical-records.select', $record));

        // Another vet sees whose record it is (the screens use the id to hide their buttons).
        $this->actingAs($ben)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('patientRecords.0.visits.0.recordStatus', 'Selected')
                ->where('patientRecords.0.visits.0.veterinarian', 'Ana Cruz')
                ->where('patientRecords.0.visits.0.veterinarianId', $ana->id));

        $this->actingAs($this->user('clerk'))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('patientRecords.0.visits.0.veterinarian', 'Ana Cruz'));
    }

    private function vet(string $name): User
    {
        return $this->user('veterinarian', ['name' => $name]);
    }

    /** @param  array<string, mixed>  $attributes */
    private function user(string $role, array $attributes = []): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active', ...$attributes]);
    }

    /** An accepted appointment for today, with the (Upcoming) medical record it creates. */
    private function record(): MedicalRecord
    {
        $owner = $this->user('customer');
        $pet = Pet::create(['petName' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'petOwnerID' => $owner->id]);
        $appointment = Appointment::create([
            'ar_first_name' => 'Jamie', 'ar_last_name' => 'Sample', 'pet_id' => $pet->petID,
            'service_type' => 'Consultation', 'notes' => 'Coughing', 'app_date_time' => '2026-11-26 10:00:00',
            'reference_number' => (string) $this->reference++, 'status' => Appointment::STATUS_CONFIRMED,
            'user_id' => $owner->id,
        ]);

        return MedicalRecord::forAcceptedAppointment($appointment, null);
    }

    private function supply(string $name, int $stock): MedicalSupply
    {
        return MedicalSupply::create([
            'name' => $name, 'category' => 'Medication', 'unit_of_measure' => 'pcs',
            'stock_quantity' => $stock, 'reorder_level' => 1, 'unit_price' => 50, 'is_active' => true,
        ]);
    }

    /** A real 1x1 PNG (fake()->image() needs the GD extension). */
    private function png(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));
    }

    /**
     * A filled-in diagnosis form; each test overrides only what it checks.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function form(array $overrides = []): array
    {
        return [
            'diagnosis' => 'Kennel cough',
            'treatment' => 'Doxycycline 5 days',
            'suggestions' => null,
            'lab_results' => null,
            'vet_notes' => null,
            'status' => 'Ongoing',
            'services' => [],
            'supplies' => [],
            ...$overrides,
        ];
    }
}
