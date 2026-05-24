<?php

use App\Models\Collector;
use App\Models\User;

test('store creates a collector and user then redirects', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.waste.collectors.store'), [
        'name' => 'Juan Dela Cruz',
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'contact_number' => '09171234567',
    ]);

    $response->assertRedirect(route('admin.waste.collectors.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'juan@example.com',
        'role' => 'collector',
    ]);

    $this->assertDatabaseHas('collectors', [
        'full_name' => 'Juan Dela Cruz',
        'contact_number' => '09171234567',
    ]);
});

test('store returns validation errors when required fields are missing', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.waste.collectors.store'), []);

    $response->assertSessionHasErrors(['name', 'full_name', 'email', 'contact_number']);
});

test('store returns validation error when email is already taken', function () {
    $admin = User::factory()->admin()->create();

    $existingUser = User::factory()->collector()->create(['email' => 'taken@example.com']);

    $this->actingAs($admin);

    $response = $this->post(route('admin.waste.collectors.store'), [
        'name' => 'Maria Santos',
        'full_name' => 'Maria Santos',
        'email' => 'taken@example.com',
        'contact_number' => '09181234567',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('update changes full_name and contact_number then redirects', function () {
    $admin = User::factory()->admin()->create();
    $collector = Collector::factory()->create([
        'full_name' => 'Old Name',
        'contact_number' => '09170000000',
    ]);

    $this->actingAs($admin);

    $response = $this->put(route('admin.waste.collectors.update', $collector), [
        'full_name' => 'New Name',
        'contact_number' => '09171111111',
    ]);

    $response->assertRedirect(route('admin.waste.collectors.index'));

    $this->assertDatabaseHas('collectors', [
        'id' => $collector->id,
        'full_name' => 'New Name',
        'contact_number' => '09171111111',
    ]);
});

test('update returns validation errors when required fields are missing', function () {
    $admin = User::factory()->admin()->create();
    $collector = Collector::factory()->create();

    $this->actingAs($admin);

    $response = $this->put(route('admin.waste.collectors.update', $collector), []);

    $response->assertSessionHasErrors(['full_name', 'contact_number']);
});

test('destroy deletes the collector and associated user then redirects', function () {
    $admin = User::factory()->admin()->create();
    $collector = Collector::factory()->create();
    $userId = $collector->user_id;

    $this->actingAs($admin);

    $response = $this->delete(route('admin.waste.collectors.destroy', $collector));

    $response->assertRedirect(route('admin.waste.collectors.index'));

    $this->assertDatabaseMissing('collectors', ['id' => $collector->id]);
    $this->assertDatabaseMissing('users', ['id' => $userId]);
});
