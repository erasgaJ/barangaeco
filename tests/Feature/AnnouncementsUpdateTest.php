<?php

use App\Models\Announcement;
use App\Models\User;

test('admin can update an announcement', function () {
    $admin = User::factory()->admin()->create();
    $announcement = Announcement::factory()->create(['title' => 'Old Title']);

    $this->actingAs($admin);

    $response = $this->put(route('admin.announcements.update', $announcement), [
        'title' => 'Updated Title',
        'message' => 'Updated message content here.',
        'target_audience' => 'residents',
        'scheduled_at' => null,
    ]);

    $response->assertRedirect(route('admin.announcements.index'));

    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'title' => 'Updated Title',
        'target_audience' => 'residents',
    ]);
});

test('update requires title and message', function () {
    $admin = User::factory()->admin()->create();
    $announcement = Announcement::factory()->create();

    $this->actingAs($admin);

    $response = $this->put(route('admin.announcements.update', $announcement), [
        'title' => '',
        'message' => '',
        'target_audience' => 'all',
    ]);

    $response->assertSessionHasErrors(['title', 'message']);
});

test('update returns 404 for missing announcement', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    $response = $this->put(route('admin.announcements.update', 99999), [
        'title' => 'Some Title',
        'message' => 'Some message.',
        'target_audience' => 'all',
    ]);

    $response->assertNotFound();
});
