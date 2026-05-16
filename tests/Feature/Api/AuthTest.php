<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

it('has auth routes', function () {
    $routes = collect(Route::getRoutes()->getRoutes())->map(fn ($r) => $r->uri());
    expect($routes)->toContain('api/auth/login')
        ->and($routes)->toContain('api/auth/register')
        ->and($routes)->toContain('api/auth/logout')
        ->and($routes)->toContain('api/auth/me');
});
