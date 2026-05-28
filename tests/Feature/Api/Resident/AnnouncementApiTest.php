<?php

use App\Models\Announcement;
use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function announcementResidentToken(): array
{
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    $resident = Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $resident, $token];
}

// ─── index ────────────────────────────────────────────────────────────────────

it('returns 401 on announcements index when unauthenticated', function () {
    $this->getJson('/api/resident/announcements')->assertStatus(401);
});

it('returns 200 with paginated structure on announcements index when authenticated', function () {
    [, , $token] = announcementResidentToken();

    Announcement::factory()->create(['target_audience' => 'all', 'published_at' => now()]);

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200)
        ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
});

it('excludes scheduled announcements with null published_at from index', function () {
    [, , $token] = announcementResidentToken();

    $published = Announcement::factory()->create(['target_audience' => 'all', 'published_at' => now()]);
    Announcement::factory()->scheduled()->create(['target_audience' => 'all']);

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200);
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($published->id);
    expect(count($ids))->toBe(1);
});

it('excludes future published_at announcements from index', function () {
    [, , $token] = announcementResidentToken();

    $published = Announcement::factory()->create(['target_audience' => 'residents', 'published_at' => now()->subMinute()]);
    Announcement::factory()->create(['target_audience' => 'residents', 'published_at' => now()->addHour()]);

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200);
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($published->id);
    expect(count($ids))->toBe(1);
});

it('excludes collectors-only announcements from index', function () {
    [, , $token] = announcementResidentToken();

    $visible = Announcement::factory()->create(['target_audience' => 'residents', 'published_at' => now()]);
    Announcement::factory()->collectorsOnly()->create();

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200);
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($visible->id);
    expect(count($ids))->toBe(1);
});

it('returns announcements ordered by published_at descending on index', function () {
    [, , $token] = announcementResidentToken();

    $older = Announcement::factory()->create(['target_audience' => 'all', 'published_at' => now()->subDays(2)]);
    $newer = Announcement::factory()->create(['target_audience' => 'all', 'published_at' => now()->subDay()]);

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200);
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids[0])->toBe($newer->id);
    expect($ids[1])->toBe($older->id);
});

it('paginates at 15 per page on announcements index', function () {
    [, , $token] = announcementResidentToken();

    Announcement::factory()->count(16)->create(['target_audience' => 'all', 'published_at' => now()]);

    $response = $this->withToken($token)->getJson('/api/resident/announcements');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(15);
    expect($response->json('next_page_url'))->not->toBeNull();
});

// ─── show ─────────────────────────────────────────────────────────────────────

it('returns 200 with full announcement on show when authenticated and published resident-visible', function () {
    [, , $token] = announcementResidentToken();

    $announcement = Announcement::factory()->create(['target_audience' => 'residents', 'published_at' => now()]);

    $response = $this->withToken($token)->getJson("/api/resident/announcements/{$announcement->id}");

    $response->assertStatus(200)
        ->assertJsonPath('id', $announcement->id)
        ->assertJsonStructure(['id', 'title', 'message', 'target_audience', 'published_at', 'scheduled_at', 'created_at']);
});

it('returns 401 on announcement show when unauthenticated', function () {
    $announcement = Announcement::factory()->create(['target_audience' => 'all', 'published_at' => now()]);

    $this->getJson("/api/resident/announcements/{$announcement->id}")->assertStatus(401);
});

it('returns 404 for a non-existent announcement on show', function () {
    [, , $token] = announcementResidentToken();

    $this->withToken($token)->getJson('/api/resident/announcements/99999')->assertStatus(404);
});

it('returns 403 for a scheduled unpublished announcement on show', function () {
    [, , $token] = announcementResidentToken();

    $announcement = Announcement::factory()->scheduled()->create(['target_audience' => 'all']);

    $this->withToken($token)->getJson("/api/resident/announcements/{$announcement->id}")->assertStatus(403);
});

it('returns 403 for a collectors-only announcement on show', function () {
    [, , $token] = announcementResidentToken();

    $announcement = Announcement::factory()->collectorsOnly()->create();

    $this->withToken($token)->getJson("/api/resident/announcements/{$announcement->id}")->assertStatus(403);
});
