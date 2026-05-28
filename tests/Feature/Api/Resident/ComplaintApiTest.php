<?php

use App\Models\Barangay;
use App\Models\Complaint;
use App\Models\Resident;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function residentWithToken(): array
{
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $token];
}

it('stores a complaint with zone_id and returns zone in response', function () {
    [$user, $token] = residentWithToken();
    $zone = Zone::factory()->create();

    $response = $this->withToken($token)->postJson('/api/resident/complaints', [
        'zone_id' => $zone->id,
        'complaint_type' => 'Noise',
        'complaint_against' => 'Neighbor',
        'description' => 'Too loud at night.',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('zone.id', $zone->id)
        ->assertJsonPath('zone.name', $zone->name);
});

it('rejects complaint store with invalid zone_id', function () {
    [$user, $token] = residentWithToken();

    $response = $this->withToken($token)->postJson('/api/resident/complaints', [
        'zone_id' => 99999,
        'complaint_type' => 'Noise',
        'complaint_against' => 'Neighbor',
        'description' => 'Too loud at night.',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['zone_id']);
});

it('stores a complaint without zone_id when zone_id is nullable', function () {
    [$user, $token] = residentWithToken();

    $response = $this->withToken($token)->postJson('/api/resident/complaints', [
        'complaint_type' => 'Road',
        'complaint_against' => 'Street crew',
        'description' => 'Road is broken.',
    ]);

    $response->assertStatus(201);
});

it('returns zone data in complaint show', function () {
    [$user, $token] = residentWithToken();
    $resident = $user->resident()->first();
    $zone = Zone::factory()->create();

    $complaint = Complaint::factory()->create([
        'resident_id' => $resident->id,
        'zone_id' => $zone->id,
        'created_by' => $user->id,
    ]);

    $response = $this->withToken($token)->getJson("/api/resident/complaints/{$complaint->id}");

    $response->assertStatus(200)
        ->assertJsonPath('zone.id', $zone->id)
        ->assertJsonPath('zone.name', $zone->name);
});

it('lists complaints with zone eager loaded', function () {
    [$user, $token] = residentWithToken();
    $resident = $user->resident()->first();
    $zone = Zone::factory()->create();

    Complaint::factory()->create([
        'resident_id' => $resident->id,
        'zone_id' => $zone->id,
        'created_by' => $user->id,
    ]);

    $response = $this->withToken($token)->getJson('/api/resident/complaints');

    $response->assertStatus(200);
    $items = $response->json('data');
    expect($items)->not->toBeEmpty();
    expect($items[0])->toHaveKey('zone');
    expect($items[0]['zone']['id'])->toBe($zone->id);
});

// -----------------------------------------------------------------------
// Phase 1 — Auth guard tests
// -----------------------------------------------------------------------

it('returns 401 on GET /api/resident/complaints when unauthenticated', function () {
    $this->getJson('/api/resident/complaints')
        ->assertStatus(401);
});

it('returns 401 on POST /api/resident/complaints when unauthenticated', function () {
    $this->postJson('/api/resident/complaints', [
        'complaint_type' => 'Noise',
        'complaint_against' => 'Neighbor',
        'description' => 'Too loud.',
    ])->assertStatus(401);
});

it('returns 401 on GET /api/resident/complaints/{id} when unauthenticated', function () {
    $this->getJson('/api/resident/complaints/1')
        ->assertStatus(401);
});

// -----------------------------------------------------------------------
// Phase 1 — Ownership isolation on index
// -----------------------------------------------------------------------

it('index returns only the authenticated resident\'s own complaints', function () {
    [$userA, $tokenA] = residentWithToken();
    [$userB, $tokenB] = residentWithToken();

    $residentA = $userA->resident()->first();
    $residentB = $userB->resident()->first();

    $complaintA = Complaint::factory()->create([
        'resident_id' => $residentA->id,
        'created_by' => $userA->id,
    ]);

    $complaintB = Complaint::factory()->create([
        'resident_id' => $residentB->id,
        'created_by' => $userB->id,
    ]);

    $response = $this->withToken($tokenA)->getJson('/api/resident/complaints');

    $response->assertStatus(200);
    $ids = collect($response->json('data'))->pluck('id')->all();

    expect($ids)->toContain($complaintA->id);
    expect($ids)->not->toContain($complaintB->id);
});

// -----------------------------------------------------------------------
// Phase 1 — Ownership 403 on show
// -----------------------------------------------------------------------

it('returns 403 when resident A requests a complaint belonging to resident B', function () {
    [$userA, $tokenA] = residentWithToken();
    [$userB, $tokenB] = residentWithToken();

    $residentB = $userB->resident()->first();

    $complaintB = Complaint::factory()->create([
        'resident_id' => $residentB->id,
        'created_by' => $userB->id,
    ]);

    $this->withToken($tokenA)
        ->getJson("/api/resident/complaints/{$complaintB->id}")
        ->assertStatus(403);
});

// -----------------------------------------------------------------------
// Phase 1 — Not-found 404 on show
// -----------------------------------------------------------------------

it('returns 404 for a non-existent complaint ID', function () {
    [$user, $token] = residentWithToken();

    $this->withToken($token)
        ->getJson('/api/resident/complaints/99999')
        ->assertStatus(404);
});

// -----------------------------------------------------------------------
// Phase 1 — Validation error tests for store
// -----------------------------------------------------------------------

it('returns 422 with complaint_type error when complaint_type is missing', function () {
    [$user, $token] = residentWithToken();

    $this->withToken($token)->postJson('/api/resident/complaints', [
        'complaint_against' => 'Neighbor',
        'description' => 'Too loud at night.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['complaint_type']);
});

it('returns 422 with complaint_against error when complaint_against is missing', function () {
    [$user, $token] = residentWithToken();

    $this->withToken($token)->postJson('/api/resident/complaints', [
        'complaint_type' => 'Noise',
        'description' => 'Too loud at night.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['complaint_against']);
});

it('returns 422 with description error when description is missing', function () {
    [$user, $token] = residentWithToken();

    $this->withToken($token)->postJson('/api/resident/complaints', [
        'complaint_type' => 'Noise',
        'complaint_against' => 'Neighbor',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['description']);
});

// -----------------------------------------------------------------------
// Phase 1 — Database persistence on store
// -----------------------------------------------------------------------

it('persists the complaint in the database with correct resident_id and status open', function () {
    [$user, $token] = residentWithToken();
    $resident = $user->resident()->first();

    $this->withToken($token)->postJson('/api/resident/complaints', [
        'complaint_type' => 'Environment',
        'complaint_against' => 'Factory nearby',
        'description' => 'Smoke is affecting air quality.',
    ])->assertStatus(201);

    $this->assertDatabaseHas('complaints', [
        'resident_id' => $resident->id,
        'complaint_type' => 'Environment',
        'complaint_against' => 'Factory nearby',
        'status' => 'open',
    ]);
});
