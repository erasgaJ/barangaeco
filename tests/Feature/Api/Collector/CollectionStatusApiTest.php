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

// ---------------------------------------------------------------------------
// Phase 2: Guard FR-2 — Unassigned collector returns 403
// ---------------------------------------------------------------------------

it('returns 403 when collector is not assigned to the schedule', function () {
    // Collector not in the schedule pivot
    $userB = User::factory()->collector()->create();
    $collectorB = Collector::factory()->create(['user_id' => $userB->id]);
    $schedule = WasteCollectionSchedule::factory()->create(['status' => 'published']);
    // Do NOT attach collectorB to the schedule
    $tokenB = $userB->createToken('Test Device')->plainTextToken;

    $response = $this->withToken($tokenB)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(403);
});

it('returns 403 when a different collector tries to post to a schedule assigned to another collector', function () {
    // Set up primary collector with schedule
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    // Create a second collector NOT attached to the same schedule
    $userB = User::factory()->collector()->create();
    $collectorB = Collector::factory()->create(['user_id' => $userB->id]);
    $tokenB = $userB->createToken('Test Device')->plainTextToken;

    $response = $this->withToken($tokenB)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'in_progress']
    );

    $response->assertStatus(403);
});

// ---------------------------------------------------------------------------
// Phase 2: Guard FR-3 — Draft schedule returns 422
// ---------------------------------------------------------------------------

it('returns 422 when the schedule is in draft status', function () {
    $user = User::factory()->collector()->create();
    $collector = Collector::factory()->create(['user_id' => $user->id]);
    $schedule = WasteCollectionSchedule::factory()->create(['status' => 'draft']);
    $schedule->collectors()->attach($collector->id);
    $token = $user->createToken('Test Device')->plainTextToken;

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Schedule is not published.');
});

// ---------------------------------------------------------------------------
// Phase 2: Guard FR-4 — Status regression from completed blocked
// ---------------------------------------------------------------------------

it('returns 422 when trying to revert completed status to in_progress', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    // Seed an existing completed status update
    CollectionStatusUpdate::factory()->create([
        'waste_collection_schedule_id' => $schedule->id,
        'collector_id' => $collector->id,
        'status' => 'completed',
    ]);

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'in_progress']
    );

    $response->assertStatus(422);
});

it('returns 422 when trying to revert completed status to pending', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    CollectionStatusUpdate::factory()->create([
        'waste_collection_schedule_id' => $schedule->id,
        'collector_id' => $collector->id,
        'status' => 'completed',
    ]);

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(422);
});

it('allows re-confirming completed status when existing status is completed', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    CollectionStatusUpdate::factory()->create([
        'waste_collection_schedule_id' => $schedule->id,
        'collector_id' => $collector->id,
        'status' => 'completed',
    ]);

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'completed', 'notes' => 'Confirmed complete']
    );

    $response->assertStatus(201);
});

// ---------------------------------------------------------------------------
// Phase 2: Validation edge cases
// ---------------------------------------------------------------------------

it('returns 422 when status field is missing', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        []
    );

    $response->assertStatus(422);
});

it('returns 422 when status value is invalid', function () {
    [$user, $collector, $schedule, $token] = collectorWithSchedule();

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'done']
    );

    $response->assertStatus(422);
});

it('returns 401 for unauthenticated requests', function () {
    $schedule = WasteCollectionSchedule::factory()->create(['status' => 'published']);

    $response = $this->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(401);
});

it('returns 403 for a user with resident role', function () {
    $user = User::factory()->resident()->create();
    $token = $user->createToken('Test Device')->plainTextToken;
    $schedule = WasteCollectionSchedule::factory()->create(['status' => 'published']);

    $response = $this->withToken($token)->postJson(
        "/api/collector/schedules/{$schedule->id}/status",
        ['status' => 'pending']
    );

    $response->assertStatus(403);
});
