<?php

use App\Models\Complaint;
use App\Models\Resident;
use App\Models\User;
use App\Models\Zone;

test('resident can view their complaints', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    Complaint::factory()->count(3)->create([
        'resident_id' => $resident->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get('/resident/complaints')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/complaints/index')
                ->has('complaints')
                ->has('zones')
        );
});

test('resident cannot see another residents complaints', function () {
    $residentA = Resident::factory()->create();
    $userA = User::find($residentA->user_id);

    $residentB = Resident::factory()->create();
    $userB = User::find($residentB->user_id);

    Complaint::factory()->create([
        'resident_id' => $residentB->id,
        'created_by' => $userB->id,
    ]);

    $this->actingAs($userA)
        ->get('/resident/complaints')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/complaints/index')
                ->where('complaints.data', fn ($data) => collect($data)->every(fn ($item) => $item['resident_id'] !== $residentB->id))
        );
});

test('resident can file a complaint', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);
    $zone = Zone::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->post('/resident/complaints', [
            'zone_id' => $zone->id,
            'complaint_type' => 'Noise',
            'complaint_against' => 'Neighbor',
            'description' => 'Loud music at night',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('complaints', [
        'resident_id' => $resident->id,
        'complaint_type' => 'Noise',
        'priority' => 'low',
        'status' => 'open',
        'created_by' => $user->id,
    ]);
});

test('complaint store validates required fields', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $this->actingAs($user)
        ->post('/resident/complaints', [])
        ->assertSessionHasErrors(['complaint_type', 'description']);
});

test('resident can cancel an open complaint', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $complaint = Complaint::factory()->create([
        'resident_id' => $resident->id,
        'status' => 'open',
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete("/resident/complaints/{$complaint->id}")
        ->assertRedirect();

    $this->assertDatabaseHas('complaints', [
        'id' => $complaint->id,
        'status' => 'cancelled',
    ]);
});

test('resident cannot cancel an in_progress complaint', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $complaint = Complaint::factory()->inProgress()->create([
        'resident_id' => $resident->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete("/resident/complaints/{$complaint->id}")
        ->assertStatus(422);
});

test('resident cannot cancel another residents complaint', function () {
    $residentA = Resident::factory()->create();
    $userA = User::find($residentA->user_id);

    $residentB = Resident::factory()->create();
    $userB = User::find($residentB->user_id);

    $complaint = Complaint::factory()->create([
        'resident_id' => $residentB->id,
        'status' => 'open',
        'created_by' => $userB->id,
    ]);

    $this->actingAs($userA)
        ->delete("/resident/complaints/{$complaint->id}")
        ->assertStatus(403);
});
