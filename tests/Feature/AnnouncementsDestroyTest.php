<?php

use App\Models\Announcement;
use App\Models\User;

test('admin can delete an announcement', function () {
    $admin = User::factory()->admin()->create();
    $announcement = Announcement::factory()->create();

    $this->actingAs($admin);

    $response = $this->delete(route('admin.announcements.destroy', $announcement));

    $response->assertRedirect(route('admin.announcements.index'));

    $this->assertDatabaseMissing('announcements', [
        'id' => $announcement->id,
    ]);
});

test('unauthenticated user cannot delete an announcement', function () {
    $announcement = Announcement::factory()->create();

    $response = $this->delete(route('admin.announcements.destroy', $announcement));

    $response->assertRedirect(route('login'));
});
