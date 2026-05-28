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
