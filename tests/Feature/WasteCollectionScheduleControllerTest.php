<?php

use App\Models\Barangay;
use App\Models\Collector;
use App\Models\User;
use App\Models\WasteCollectionSchedule;

test('schedules index returns collectors prop with full_name, contact_number, and user email', function () {
    $admin = User::factory()->admin()->create();

    $collector = Collector::factory()->create();

    $this->actingAs($admin);

    $response = $this->get(route('admin.waste.schedules.index'));

    $response->assertOk();

    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/waste-management/schedules')
            ->has('collectors', 1)
            ->has('collectors.0', fn ($item) => $item
                ->where('full_name', $collector->full_name)
                ->where('contact_number', $collector->contact_number)
                ->has('user')
                ->where('user.email', $collector->user->email)
                ->etc()
            )
    );
});

test('authenticated admin can store a schedule with valid payload', function () {
    $admin = User::factory()->admin()->create();
    $barangay = Barangay::factory()->create();
    $collector = Collector::factory()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.waste.schedules.store'), [
        'barangay_id' => $barangay->id,
        'scheduled_date' => '2026-06-01',
        'scheduled_time' => '08:30',
        'collector_ids' => [$collector->id],
        'status' => 'published',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('waste_collection_schedules', [
        'barangay_id' => $barangay->id,
        'scheduled_time' => '08:30',
        'status' => 'published',
        'created_by' => $admin->id,
    ]);

    $schedule = WasteCollectionSchedule::where('barangay_id', $barangay->id)->first();
    expect($schedule->collectors)->toHaveCount(1);
    expect($schedule->collectors->first()->id)->toBe($collector->id);
});

test('store schedule returns validation errors for missing required fields', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.waste.schedules.store'), []);

    $response->assertSessionHasErrors(['barangay_id', 'scheduled_date', 'scheduled_time', 'collector_ids', 'status']);
});
