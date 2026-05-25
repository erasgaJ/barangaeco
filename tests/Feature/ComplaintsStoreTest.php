<?php

use App\Models\User;
use App\Models\Zone;

it('allows admin to store a complaint', function () {
    $admin = User::factory()->admin()->create();
    $zone = Zone::factory()->create();

    $response = $this->actingAs($admin)->post(route('admin.complaints.store'), [
        'zone_id' => $zone->id,
        'complaint_type' => 'Road',
        'complaint_against' => 'DPWH contractor',
        'description' => 'Maraming butas sa kalsada.',
        'priority' => 'high',
    ]);

    $response->assertRedirect(route('admin.complaints.index'));
    $this->assertDatabaseHas('complaints', [
        'zone_id' => $zone->id,
        'complaint_type' => 'Road',
    ]);
});

it('requires all fields when storing a complaint', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.complaints.store'), [])
        ->assertSessionHasErrors(['complaint_type', 'complaint_against', 'description', 'priority']);
});

it('rejects unauthenticated complaint store', function () {
    $this->post(route('admin.complaints.store'))
        ->assertRedirect(route('login'));
});
