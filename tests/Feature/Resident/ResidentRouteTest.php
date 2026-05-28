<?php

use App\Models\User;

test('guest is redirected to login for all resident routes', function () {
    $routes = [
        '/resident/dashboard',
        '/resident/document-requests',
        '/resident/complaints',
        '/resident/announcements',
    ];

    foreach ($routes as $route) {
        $this->get($route)->assertRedirect('/login');
    }
});

test('admin is forbidden from resident routes', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $routes = [
        '/resident/dashboard',
        '/resident/document-requests',
        '/resident/complaints',
        '/resident/announcements',
    ];

    foreach ($routes as $route) {
        $this->get($route)->assertForbidden();
    }
});

test('resident can access resident dashboard', function () {
    $user = User::factory()->resident()->create();
    $this->actingAs($user);

    $this->get('/resident/dashboard')->assertOk();
});

test('resident is redirected from /dashboard to /resident/dashboard', function () {
    $user = User::factory()->resident()->create();
    $this->actingAs($user);

    $this->get('/dashboard')->assertRedirect('/resident/dashboard');
});
