<?php

use App\Models\User;

test('admin can store an announcement', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.announcements.store'), [
        'title' => 'Barangay Clean-Up Drive',
        'message' => 'Join us this Saturday for our monthly clean-up drive.',
        'target_audience' => 'all',
    ]);

    $response->assertRedirect(route('admin.announcements.index'));

    $this->assertDatabaseHas('announcements', [
        'title' => 'Barangay Clean-Up Drive',
        'target_audience' => 'all',
    ]);
});

test('store requires title and message', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->post(route('admin.announcements.store'), [
        'title' => '',
        'message' => '',
        'target_audience' => 'all',
    ]);

    $response->assertSessionHasErrors(['title', 'message']);
});

test('unauthenticated user cannot store an announcement', function () {
    $response = $this->post(route('admin.announcements.store'), [
        'title' => 'Barangay Clean-Up Drive',
        'message' => 'Join us this Saturday for our monthly clean-up drive.',
        'target_audience' => 'all',
    ]);

    $response->assertRedirect(route('login'));
});
