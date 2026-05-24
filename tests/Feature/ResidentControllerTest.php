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

test('authenticated admin can delete a resident', function () {
    $admin = User::factory()->admin()->create();
    $barangay = Barangay::factory()->create();
    $residentUser = User::factory()->create(['role' => 'resident']);
    $resident = Resident::factory()->create([
        'user_id' => $residentUser->id,
        'barangay_id' => $barangay->id,
        'full_name' => 'To Be Deleted',
        'address' => 'Some Street',
        'contact_number' => '09000000001',
    ]);

    $this->actingAs($admin);

    $response = $this->delete(route('admin.residents.destroy', $resident));

    $response->assertRedirect(route('admin.residents.index'));

    $this->assertDatabaseMissing('residents', ['id' => $resident->id]);
});

test('authenticated admin can update a resident', function () {
    $admin = User::factory()->admin()->create();
    $barangay = Barangay::factory()->create();
    $newBarangay = Barangay::factory()->create();
    $residentUser = User::factory()->create(['role' => 'resident']);
    $resident = Resident::factory()->create([
        'user_id' => $residentUser->id,
        'barangay_id' => $barangay->id,
        'full_name' => 'Old Name',
        'address' => 'Old Address',
        'contact_number' => '09000000000',
    ]);

    $this->actingAs($admin);

    $response = $this->put(route('admin.residents.update', $resident), [
        'full_name' => 'New Name',
        'address' => 'New Address',
        'barangay_id' => $newBarangay->id,
        'contact_number' => '09181234567',
    ]);

    $response->assertRedirect(route('admin.residents.index'));

    $this->assertDatabaseHas('residents', [
        'id' => $resident->id,
        'full_name' => 'New Name',
        'address' => 'New Address',
        'barangay_id' => $newBarangay->id,
        'contact_number' => '09181234567',
    ]);
});
