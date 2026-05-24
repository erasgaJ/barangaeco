<?php

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;

test('store creates a resident and user then redirects', function () {
    $admin = User::factory()->admin()->create();
    $barangay = Barangay::factory()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.residents.store'), [
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
        'full_name' => 'Maria Santos',
        'address' => '123 Rizal Street',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
    ]);

    $response->assertRedirect(route('admin.residents.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'maria@example.com',
        'role' => 'resident',
    ]);

    $this->assertDatabaseHas('residents', [
        'full_name' => 'Maria Santos',
        'address' => '123 Rizal Street',
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
    ]);
});

test('store returns validation errors when required fields are missing', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.residents.store'), []);

    $response->assertSessionHasErrors(['name', 'email', 'full_name', 'address', 'barangay_id', 'contact_number']);
});
