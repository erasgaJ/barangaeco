<?php

use App\Models\Announcement;
use App\Models\Resident;
use App\Models\User;

test('resident can view published announcements', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    Announcement::factory()->count(3)->create([
        'target_audience' => 'all',
        'published_at' => now()->subDay(),
    ]);

    $this->actingAs($user)
        ->get('/resident/announcements')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/announcements/index')
                ->has('announcements')
        );
});

test('announcements only includes published ones', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $published = Announcement::factory()->create([
        'target_audience' => 'all',
        'published_at' => now()->subHour(),
        'title' => 'Published Announcement',
    ]);

    Announcement::factory()->create([
        'target_audience' => 'all',
        'published_at' => null,
        'title' => 'Draft Announcement',
    ]);

    $this->actingAs($user)
        ->get('/resident/announcements')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/announcements/index')
                ->where('announcements.data', fn ($data) => collect($data)->every(fn ($item) => $item['id'] === $published->id))
        );
});

test('announcements excludes collector targeted ones', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    Announcement::factory()->collectorsOnly()->create([
        'title' => 'Collectors Only',
    ]);

    Announcement::factory()->create([
        'target_audience' => 'residents',
        'published_at' => now()->subHour(),
        'title' => 'For Residents',
    ]);

    $response = $this->actingAs($user)
        ->get('/resident/announcements')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/announcements/index')
                ->where('announcements.data', fn ($data) => collect($data)->every(fn ($item) => $item['target_audience'] !== 'collectors'))
        );
});

test('announcements includes all and residents targeted', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $forAll = Announcement::factory()->create([
        'target_audience' => 'all',
        'published_at' => now()->subHour(),
        'title' => 'For Everyone',
    ]);

    $forResidents = Announcement::factory()->create([
        'target_audience' => 'residents',
        'published_at' => now()->subHour(),
        'title' => 'For Residents',
    ]);

    $this->actingAs($user)
        ->get('/resident/announcements')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/announcements/index')
                ->where('announcements.data', function ($data) use ($forAll, $forResidents) {
                    $ids = collect($data)->pluck('id');

                    return $ids->contains($forAll->id) && $ids->contains($forResidents->id);
                })
        );
});

test('future scheduled announcements are excluded', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    Announcement::factory()->create([
        'target_audience' => 'all',
        'published_at' => now()->addDay(),
        'title' => 'Future Announcement',
    ]);

    Announcement::factory()->create([
        'target_audience' => 'all',
        'published_at' => now()->subHour(),
        'title' => 'Past Announcement',
    ]);

    $this->actingAs($user)
        ->get('/resident/announcements')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/announcements/index')
                ->where('announcements.data', fn ($data) => collect($data)->every(fn ($item) => $item['title'] !== 'Future Announcement'))
        );
});
