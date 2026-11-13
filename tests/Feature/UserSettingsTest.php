<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UserSettingsTest extends TestCase
{
    use RefreshDatabase;

    private const SUPABASE = 'https://project.supabase.test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.supabase.url' => self::SUPABASE,
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.profile_photos_bucket' => 'profile-photos',
        ]);

        Http::fake([
            self::SUPABASE.'/storage/v1/object/sign/*' => Http::response(['signedURL' => '/object/sign/profile-photos/x.png?token=abc']),
            self::SUPABASE.'/storage/v1/object/*' => Http::response(['Key' => 'ok']),
        ]);
    }

    public function test_user_can_upload_a_profile_photo_and_old_one_is_deleted(): void
    {
        $user = $this->makeCustomer(['profile_photo_path' => '1/old.png']);

        $this->actingAs($user)
            ->post(route('settings.photo.update'), ['photo' => UploadedFile::fake()->createWithContent('me.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))])
            ->assertSessionHasNoErrors();

        $path = $user->fresh()->profile_photo_path;
        $this->assertNotSame('1/old.png', $path);
        $this->assertStringStartsWith($user->id.'/', $path);

        Http::assertSent(fn (HttpRequest $r) => $r->method() === 'POST' && $r->url() === self::SUPABASE.'/storage/v1/object/profile-photos/'.$path);
        Http::assertSent(fn (HttpRequest $r) => $r->method() === 'DELETE' && $r['prefixes'] === ['1/old.png']);

        $this->actingAs($user)->get(route('settings.photo.show'))
            ->assertRedirect(self::SUPABASE.'/storage/v1/object/sign/profile-photos/x.png?token=abc');
    }

    public function test_profile_photo_must_be_an_image(): void
    {
        $this->actingAs($this->makeCustomer())
            ->post(route('settings.photo.update'), ['photo' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
            ->assertSessionHasErrors('photo');

        Http::assertNothingSent();
    }

    public function test_user_can_update_address_but_not_other_profile_fields(): void
    {
        $user = $this->makeCustomer();

        $this->actingAs($user)
            ->put(route('settings.address.update'), [
                'address' => 'Blk 28 Lot 3, Quezon City',
                'name' => 'Hacker',
                'email' => 'other@example.test',
                'role' => 'admin',
            ])
            ->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('Blk 28 Lot 3, Quezon City', $user->address);
        $this->assertNotSame('Hacker', $user->name);
        $this->assertNotSame('other@example.test', $user->email);
        $this->assertSame('customer', $user->role);
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = $this->makeCustomer(['password' => Hash::make('oldpass123')]);

        $this->actingAs($user)
            ->put(route('settings.password.update'), [
                'current_password' => 'wrong-pass1',
                'password' => 'newpass123',
                'password_confirmation' => 'newpass123',
            ])
            ->assertSessionHasErrors('current_password');
        $this->assertTrue(Hash::check('oldpass123', $user->fresh()->password));

        $this->actingAs($user)
            ->put(route('settings.password.update'), [
                'current_password' => 'oldpass123',
                'password' => 'newpass123',
                'password_confirmation' => 'newpass123',
            ])
            ->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('newpass123', $user->fresh()->password));
    }

    /** @param array<string, mixed> $attributes */
    private function makeCustomer(array $attributes = []): User
    {
        return User::factory()->create(['role' => 'customer', 'status' => 'Active', ...$attributes]);
    }
}
