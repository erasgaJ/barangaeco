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
