<?php

use App\Models\Barangay;
use App\Models\Collector;
use App\Models\Resident;
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

it('logs in a resident and returns a token with resident profile', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Test Device',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role', 'resident']])
        ->assertJsonPath('user.role', 'resident')
        ->assertJsonMissing(['password']);
});

it('logs in a collector and returns a token with collector profile', function () {
    $user = User::factory()->collector()->create();
    Collector::factory()->create(['user_id' => $user->id]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Test Device',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role', 'collector']])
        ->assertJsonPath('user.role', 'collector');
});

it('fails login with incorrect password', function () {
    $user = User::factory()->resident()->create();

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
        'device_name' => 'Test Device',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('fails login with non-existent email', function () {
    $this->postJson('/api/auth/login', [
        'email' => 'nobody@example.com',
        'password' => 'password',
        'device_name' => 'Test Device',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('fails login when device_name is missing', function () {
    $user = User::factory()->resident()->create();

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertStatus(422)->assertJsonValidationErrors(['device_name']);
});

it('logs out and revokes the current token', function () {
    $user = User::factory()->resident()->create();
    $token = $user->createToken('Test Device')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertStatus(200)
        ->assertJson(['message' => 'Logged out successfully.']);

    // Token should be deleted from the database
    expect($user->tokens()->count())->toBe(0);

    // A fresh request with the old token should return 401
    auth()->forgetGuards();
    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertStatus(401);
});

it('returns 401 when logging out without a token', function () {
    $this->postJson('/api/auth/logout')
        ->assertStatus(401);
});

it('returns authenticated resident profile via me endpoint', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);

    $token = $user->createToken('Test')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'email', 'role', 'resident' => ['barangay_id']])
        ->assertJsonPath('role', 'resident');
});

it('returns authenticated collector profile via me endpoint', function () {
    $user = User::factory()->collector()->create();
    Collector::factory()->create(['user_id' => $user->id]);

    $token = $user->createToken('Test')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'email', 'role', 'collector'])
        ->assertJsonPath('role', 'collector');
});

it('returns 401 on me endpoint without token', function () {
    $this->getJson('/api/auth/me')
        ->assertStatus(401);
});

it('does not expose sensitive fields in me response', function () {
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id]);
    $token = $user->createToken('Test')->plainTextToken;

    $response = $this->withToken($token)->getJson('/api/auth/me');

    $response->assertStatus(200);
    $data = $response->json();
    expect($data)->not->toHaveKey('password')
        ->and($data)->not->toHaveKey('two_factor_secret')
        ->and($data)->not->toHaveKey('remember_token');
});
