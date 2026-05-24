<?php

use App\Models\Collector;
use App\Models\User;

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
