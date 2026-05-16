<?php

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('has auth routes', function () {
    $routes = collect(Route::getRoutes()->getRoutes())->map(fn ($r) => $r->uri());
    expect($routes)->toContain('api/auth/login')
        ->and($routes)->toContain('api/auth/register')
        ->and($routes)->toContain('api/auth/logout')
        ->and($routes)->toContain('api/auth/me');
});

it('registers a new resident and returns a token', function () {
    Storage::fake('public');

    $barangay = Barangay::factory()->create();
    $idImage = UploadedFile::fake()->image('id.jpg');

    $response = $this->postJson('/api/auth/register', [
        'name' => 'Juan dela Cruz',
        'email' => 'juan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'full_name' => 'Juan dela Cruz',
        'address' => '123 Mabini St',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
        'id_image' => $idImage,
        'device_name' => 'Juan iPhone',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role', 'resident']])
        ->assertJsonPath('user.role', 'resident')
        ->assertJsonPath('user.resident.verification_status', 'pending');
});

it('fails registration with duplicate email', function () {
    Storage::fake('public');

    $barangay = Barangay::factory()->create();
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/auth/register', [
        'name' => 'Test',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'full_name' => 'Test User',
        'address' => '123 St',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
        'id_image' => UploadedFile::fake()->image('id.jpg'),
        'device_name' => 'Test Device',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('fails registration with missing required fields', function () {
    $this->postJson('/api/auth/register', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password', 'full_name', 'address', 'barangay_id', 'contact_number', 'id_image', 'device_name']);
});

it('fails registration when barangay_id does not exist', function () {
    Storage::fake('public');

    $this->postJson('/api/auth/register', [
        'name' => 'Juan',
        'email' => 'juan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'full_name' => 'Juan',
        'address' => '123 St',
        'barangay_id' => 99999,
        'contact_number' => '09171234567',
        'id_image' => UploadedFile::fake()->image('id.jpg'),
        'device_name' => 'Test',
    ])->assertStatus(422)->assertJsonValidationErrors(['barangay_id']);
});

it('fails registration when password confirmation does not match', function () {
    Storage::fake('public');

    $barangay = Barangay::factory()->create();

    $this->postJson('/api/auth/register', [
        'name' => 'Juan',
        'email' => 'juan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different',
        'full_name' => 'Juan',
        'address' => '123 St',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
        'id_image' => UploadedFile::fake()->image('id.jpg'),
        'device_name' => 'Test',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);
});

it('fails registration when id_image exceeds 5MB', function () {
    Storage::fake('public');

    $barangay = Barangay::factory()->create();
    $largeFile = UploadedFile::fake()->create('id.jpg', 6000, 'image/jpeg');

    $this->postJson('/api/auth/register', [
        'name' => 'Juan',
        'email' => 'juan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'full_name' => 'Juan',
        'address' => '123 St',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
        'id_image' => $largeFile,
        'device_name' => 'Test',
    ])->assertStatus(422)->assertJsonValidationErrors(['id_image']);
});

it('fails registration when id_image is not an image', function () {
    Storage::fake('public');

    $barangay = Barangay::factory()->create();
    $pdf = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

    $this->postJson('/api/auth/register', [
        'name' => 'Juan',
        'email' => 'juan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'full_name' => 'Juan',
        'address' => '123 St',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
        'id_image' => $pdf,
        'device_name' => 'Test',
    ])->assertStatus(422)->assertJsonValidationErrors(['id_image']);
});
