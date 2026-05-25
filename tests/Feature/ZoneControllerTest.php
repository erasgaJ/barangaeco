<?php

use App\Models\User;
use App\Models\Zone;

it('shows zones index page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.zones.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/zones/index')
        ->has('zones')
    );
});

it('validates zone name is required on store', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.zones.store'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('validates zone name is unique on store', function () {
    $admin = User::factory()->admin()->create();
    Zone::factory()->create(['name' => 'Existing Zone']);

    $response = $this->actingAs($admin)->post(route('admin.zones.store'), [
        'name' => 'Existing Zone',
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('stores a zone', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.zones.store'), [
        'name' => 'Test Zone',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.zones.index'));
    $this->assertDatabaseHas('zones', [
        'name' => 'Test Zone',
        'is_active' => true,
    ]);
});

it('updates a zone', function () {
    $admin = User::factory()->admin()->create();
    $zone = Zone::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($admin)->put(route('admin.zones.update', $zone), [
        'name' => 'New Name',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('admin.zones.index'));
    $this->assertDatabaseHas('zones', [
        'id' => $zone->id,
        'name' => 'New Name',
    ]);
});

it('deletes a zone', function () {
    $admin = User::factory()->admin()->create();
    $zone = Zone::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.zones.destroy', $zone));

    $response->assertRedirect(route('admin.zones.index'));
    $this->assertDatabaseMissing('zones', ['id' => $zone->id]);
});
