<?php

use App\Models\CollectionStatusUpdate;
use App\Models\Collector;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Creates a collector user with a Sanctum token and a published schedule
 * that the collector is assigned to.
 *
 * @return array{0: User, 1: Collector, 2: WasteCollectionSchedule, 3: string}
 */
function collectorWithSchedule(): array
{
    $user = User::factory()->collector()->create();
    $collector = Collector::factory()->create(['user_id' => $user->id]);
    $schedule = WasteCollectionSchedule::factory()->create(['status' => 'published']);
    $schedule->collectors()->attach($collector->id);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $collector, $schedule, $token];
}

it('allows an assigned collector to post a status update and returns 201', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(201);
});

it('response body contains required fields', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'in_progress']
    );

    $response->assertStatus(201)
        ->assertJsonStructure([
            'id',
            'waste_collection_schedule_id',
            'collector_id',
            'status',
            'notes',
        ]);
});

it('upserts the status record so only one row exists per collector-schedule pair', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'in_progress']
    );

    expect(CollectionStatusUpdate::where('waste_collection_schedule_id', $schedule->id)
        ->where('collector_id', $collector->id)
        ->count()
    )->toBe(1);
});

it('stores notes correctly when posting completed status with notes', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'completed', 'notes' => 'All bags collected']
    );

    $response->assertStatus(201)
        ->assertJsonPath('status', 'completed')
        ->assertJsonPath('notes', 'All bags collected');

    $this->assertDatabaseHas('collection_status_updates', [
        'waste_collection_schedule_id' => $schedule->id,
        'collector_id' => $collector->id,
        'status' => 'completed',
        'notes' => 'All bags collected',
    ]);
});
