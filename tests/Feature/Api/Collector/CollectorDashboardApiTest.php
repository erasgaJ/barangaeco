<?php

use App\Models\Collector;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function collectorDashboardToken(): array
{
    $user = User::factory()->collector()->create();
    $collector = Collector::factory()->create(['user_id' => $user->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $collector, $token];
}

it('returns dashboard without error', function () {
    [$user, $collector, $token] = collectorDashboardToken();

    $response = $this->withToken($token)->getJson('/api/collector/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure(['collector', 'today_schedules', 'upcoming_schedules']);
});

it('includes zone in today schedules', function () {
    [$user, $collector, $token] = collectorDashboardToken();
    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today()->toDateString(),
        'status' => 'published',
    ]);
    $schedule->collectors()->attach($collector->id);

    $response = $this->withToken($token)->getJson('/api/collector/dashboard');

    $response->assertStatus(200);
    $todaySchedules = $response->json('today_schedules');
    expect($todaySchedules)->not->toBeEmpty();
    expect($todaySchedules[0])->toHaveKey('zone');
    expect($todaySchedules[0]['zone']['id'])->toBe($zone->id);
    expect($todaySchedules[0])->toHaveKey('status_updates');
});

it('includes zone in upcoming schedules', function () {
    [$user, $collector, $token] = collectorDashboardToken();
    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today()->addDay()->toDateString(),
        'status' => 'published',
    ]);
    $schedule->collectors()->attach($collector->id);

    $response = $this->withToken($token)->getJson('/api/collector/dashboard');

    $response->assertStatus(200);
    $upcomingSchedules = $response->json('upcoming_schedules');
    expect($upcomingSchedules)->not->toBeEmpty();
    expect($upcomingSchedules[0])->toHaveKey('zone');
    expect($upcomingSchedules[0]['zone']['id'])->toBe($zone->id);
});
