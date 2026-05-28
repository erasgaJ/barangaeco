<?php

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function residentToken(): array
{
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $token];
}

it('returns dashboard without error', function () {
    [$user, $token] = residentToken();

    $response = $this->withToken($token)->getJson('/api/resident/dashboard');

    $response->assertStatus(200);
});

it('includes today schedule zone in dashboard', function () {
    [$user, $token] = residentToken();
    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today()->toDateString(),
        'status' => 'published',
    ]);

    $response = $this->withToken($token)->getJson('/api/resident/dashboard');

    $response->assertStatus(200)
        ->assertJsonPath('today_schedule.zone.id', $zone->id)
        ->assertJsonPath('today_schedule.zone.name', $zone->name);
});

it('does not return schedule from non-today dates', function () {
    [$user, $token] = residentToken();
    $zone = Zone::factory()->create();

    WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today()->subDay()->toDateString(),
        'status' => 'published',
    ]);

    $response = $this->withToken($token)->getJson('/api/resident/dashboard');

    $response->assertStatus(200)
        ->assertJsonPath('today_schedule', null);
});
