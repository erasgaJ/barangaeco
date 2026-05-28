<?php

use App\Models\Announcement;
use App\Models\Resident;
use App\Models\User;

test('resident dashboard returns correct Inertia component and props', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    Announcement::factory()->count(3)->create([
        'target_audience' => 'residents',
        'published_at' => now()->subHour(),
    ]);

    $this->actingAs($user)
        ->get('/resident/dashboard')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/dashboard')
                ->has('resident')
                ->has('pending_document_requests')
                ->has('open_complaints')
                ->has('today_schedule')
                ->has('announcements')
        );
});

test('resident dashboard redirects when no resident record is linked', function () {
    $user = User::factory()->resident()->create();

    $this->actingAs($user)
        ->get('/resident/dashboard')
        ->assertRedirect('/dashboard');
});
