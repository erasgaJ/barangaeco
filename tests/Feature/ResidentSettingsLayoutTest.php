<?php

use App\Models\Resident;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('resident can access settings profile page', function () {
    $user = User::factory()->resident()->create();
    Resident::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('auth.user.role', 'resident')
        );
});

test('admin can access settings profile page', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('auth.user.role', 'admin')
        );
});
