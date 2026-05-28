<?php

use App\Models\Collector;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function collectorWithToken(): array
{
    $user = User::factory()->collector()->create();
    $collector = Collector::factory()->create(['user_id' => $user->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $collector, $token];
}

it('lists schedules with zone data', function () {
    [$user, $collector, $token] = collectorWithToken();
    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today()->addDay()->toDateString(),
        'status' => 'published',
    ]);
    $schedule->collectors()->attach($collector->id);

    $response = $this->withToken($token)->getJson('/api/collector/schedules');

    $response->assertStatus(200);
    $items = $response->json('data');
    expect($items)->not->toBeEmpty();
    expect($items[0])->toHaveKey('zone');
    expect($items[0]['zone']['id'])->toBe($zone->id);
    expect($items[0])->toHaveKey('status_updates');
});

it('shows schedule with zone data', function () {
    [$user, $collector, $token] = collectorWithToken();
    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'status' => 'published',
    ]);
    $schedule->collectors()->attach($collector->id);

    $response = $this->withToken($token)->getJson("/api/collector/schedules/{$schedule->id}");

    $response->assertStatus(200)
        ->assertJsonPath('zone.id', $zone->id)
        ->assertJsonPath('zone.name', $zone->name);

    expect($response->json())->toHaveKey('collectors');
    expect($response->json())->toHaveKey('status_updates');
});
