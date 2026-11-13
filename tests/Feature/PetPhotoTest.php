<?php

namespace Tests\Feature;

use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PetPhotoTest extends TestCase
{
    use RefreshDatabase;

    private const SUPABASE = 'https://project.supabase.test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.supabase.url' => self::SUPABASE,
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.pet_photos_bucket' => 'pet-profiles',
        ]);

        Http::fake([
            self::SUPABASE.'/storage/v1/object/sign/*' => Http::response(['signedURL' => '/object/sign/pet-profiles/x.png?token=abc']),
            self::SUPABASE.'/storage/v1/object/*' => Http::response(['Key' => 'ok']),
        ]);
    }

    public function test_adding_a_pet_uploads_its_photo_to_supabase(): void
    {
        $customer = $this->makeUser('customer');

        $this->actingAs($customer)
            ->post(route('pets.store'), [
                'petName' => 'Milo',
                'species' => 'Dog',
                'breed' => 'Aspin',
                'photo' => $this->png('milo.png'),
            ])
            ->assertSessionHasNoErrors();

        $pet = Pet::firstOrFail();
        $this->assertSame('supabase', $pet->photo_disk);
        $this->assertStringStartsWith($customer->id.'/', $pet->photo_path);
        Http::assertSent(fn (HttpRequest $r) => $r->method() === 'POST'
            && $r->url() === self::SUPABASE.'/storage/v1/object/pet-profiles/'.$pet->photo_path);

        $this->actingAs($customer)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page->where('pets.0.photoUrl', $pet->photoUrl()));
    }

    public function test_adding_a_pet_without_a_photo_does_not_touch_storage(): void
    {
        $this->actingAs($this->makeUser('customer'))
            ->post(route('pets.store'), ['petName' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin'])
            ->assertSessionHasNoErrors();

        $this->assertNull(Pet::firstOrFail()->photo_path);
        Http::assertNothingSent();
    }

    public function test_replacing_a_photo_deletes_the_old_cloud_object(): void
    {
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer, ['photo_path' => $customer->id.'/old.png', 'photo_disk' => 'supabase']);

        $this->actingAs($customer)
            ->post(route('pets.photo.update', $pet), ['photo' => $this->png('new.png')])
            ->assertSessionHasNoErrors();

        $this->assertNotSame($customer->id.'/old.png', $pet->fresh()->photo_path);
        Http::assertSent(fn (HttpRequest $r) => $r->method() === 'DELETE' && $r['prefixes'] === [$customer->id.'/old.png']);
    }

    public function test_photo_is_visible_to_its_owner_and_staff_but_not_other_customers(): void
    {
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer, ['photo_path' => $customer->id.'/milo.png', 'photo_disk' => 'supabase']);
        $signed = self::SUPABASE.'/storage/v1/object/sign/pet-profiles/x.png?token=abc';

        $this->actingAs($customer)->get(route('pets.photo.show', $pet))->assertRedirect($signed);
        $this->actingAs($this->makeUser('clerk'))->get(route('pets.photo.show', $pet))->assertRedirect($signed);
        $this->actingAs($this->makeUser('veterinarian'))->get(route('pets.photo.show', $pet))->assertRedirect($signed);
        $this->actingAs($this->makeUser('customer'))->get(route('pets.photo.show', $pet))->assertForbidden();
    }

    private function makeUser(string $role): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active']);
    }

    /** @param array<string, mixed> $attributes */
    private function makePet(User $owner, array $attributes = []): Pet
    {
        return Pet::create([
            'petName' => 'Milo',
            'species' => 'Dog',
            'breed' => 'Aspin',
            'petOwnerID' => $owner->id,
            ...$attributes,
        ]);
    }

    private function png(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
        );
    }
}
