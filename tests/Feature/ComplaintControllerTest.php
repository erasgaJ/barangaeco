<?php

use App\Models\User;
use App\Models\Zone;

it('index passes zones to Inertia', function () {
    $admin = User::factory()->admin()->create();
    Zone::factory()->create(['is_active' => true]);

    $response = $this->actingAs($admin)->get(route('admin.complaints.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/complaints/index')
        ->has('zones')
    );
});

it('stores complaint with zone_id', function () {
    $admin = User::factory()->admin()->create();
    $zone = Zone::factory()->create();

    $response = $this->actingAs($admin)->post(route('admin.complaints.store'), [
        'zone_id' => $zone->id,
        'complaint_type' => 'Environmental',
        'complaint_against' => 'Neighbor',
        'description' => 'Burning garbage near residential area.',
        'priority' => 'medium',
    ]);

    $response->assertRedirect(route('admin.complaints.index'));
    $this->assertDatabaseHas('complaints', [
        'zone_id' => $zone->id,
        'complaint_type' => 'Environmental',
    ]);
});
