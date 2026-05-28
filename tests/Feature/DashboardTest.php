<?php

use App\Models\CollectionStatusUpdate;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('stats prop contains all required keys', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard')
        ->has('stats.total_residents')
        ->has('stats.pending_document_requests')
        ->has('stats.active_routes')
        ->has('stats.open_complaints')
        ->has('stats.residents_this_month')
    );
});

test('stats.residents_this_month reflects residents created this month', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    Resident::factory()->count(3)->create([
        'created_at' => now(),
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.residents_this_month', 3)
    );
});

test('today_schedules items have zone_name and status_update keys', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $zone = Zone::factory()->create(['name' => 'Zone Alpha']);

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today(),
        'status' => 'published',
    ]);

    $statusUpdate = CollectionStatusUpdate::factory()->create([
        'waste_collection_schedule_id' => $schedule->id,
        'status' => 'in_progress',
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('today_schedules', 1, fn ($item) => $item
            ->has('zone_name')
            ->has('status_update')
            ->where('zone_name', 'Zone Alpha')
            ->where('status_update.status', 'in_progress')
            ->etc()
        )
    );
});

test('today_schedules status_update has time key', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $zone = Zone::factory()->create();

    $schedule = WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today(),
        'status' => 'published',
    ]);

    CollectionStatusUpdate::factory()->create([
        'waste_collection_schedule_id' => $schedule->id,
        'status' => 'completed',
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('today_schedules', 1, fn ($item) => $item
            ->has('status_update.time')
            ->etc()
        )
    );
});

test('recent_document_requests items have resident_name key', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $resident = Resident::factory()->create([
        'full_name' => 'Juan Dela Cruz',
    ]);

    DocumentRequest::factory()->create([
        'resident_id' => $resident->id,
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('recent_document_requests.0.resident_name')
        ->where('recent_document_requests.0.resident_name', 'Juan Dela Cruz')
    );
});

// --- Edge-case tests ---

test('stats.residents_this_month is zero when no residents were created this month', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    // Create a resident with a created_at in a previous month to confirm they are excluded
    Resident::factory()->create([
        'created_at' => now()->subMonth(),
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.residents_this_month', 0)
    );
});

test('today_schedules is an empty array when no published schedules exist for today', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    // Schedule published for tomorrow — should not appear
    WasteCollectionSchedule::factory()->create([
        'scheduled_date' => today()->addDay(),
        'status' => 'published',
    ]);

    // Schedule for today but draft — should not appear
    WasteCollectionSchedule::factory()->create([
        'scheduled_date' => today(),
        'status' => 'draft',
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('today_schedules', [])
    );
});

test('today_schedules zone_name is Unknown Zone when schedule has no zone', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    // zone_id is nullable (nullOnDelete) — create schedule without a zone
    WasteCollectionSchedule::factory()->create([
        'zone_id' => null,
        'scheduled_date' => today(),
        'status' => 'published',
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('today_schedules', 1, fn ($item) => $item
            ->where('zone_name', 'Unknown Zone')
            ->etc()
        )
    );
});

test('today_schedules status_update is null when schedule has no status updates', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $zone = Zone::factory()->create();

    WasteCollectionSchedule::factory()->create([
        'zone_id' => $zone->id,
        'scheduled_date' => today(),
        'status' => 'published',
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('today_schedules', 1, fn ($item) => $item
            ->where('status_update', null)
            ->etc()
        )
    );
});

test('recent_document_requests is an empty array when no document requests exist', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('recent_document_requests', [])
    );
});

// NOTE: The "document request with null resident → resident_name is 'Unknown Resident'" edge case
// cannot be tested cleanly with factories. The `resident_id` column is non-nullable with a
// foreign key constraint, and the relationship uses cascadeOnDelete — so if a resident were
// deleted, the document request would be deleted too. There is no valid DB path to produce a
// DocumentRequest whose eager-loaded `resident` relation is null at query time.
// The null-guard in the controller (`$req->resident?->full_name ?? 'Unknown Resident'`) is
// a defensive fallback for corrupt data only and cannot be exercised through normal test flows.
