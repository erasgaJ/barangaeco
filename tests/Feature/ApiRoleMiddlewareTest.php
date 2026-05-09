<?php

use Illuminate\Support\Facades\Route;

test('admin can access resident api route group through role middleware', function () {
    expect(Route::getRoutes()->match(request()->create('/api/resident/document-requests', 'GET'))->gatherMiddleware())
        ->toContain('auth:sanctum')
        ->toContain('role:resident,admin');
});

test('admin can access collector api route group through role middleware', function () {
    expect(Route::getRoutes()->match(request()->create('/api/collector/schedules', 'GET'))->gatherMiddleware())
        ->toContain('auth:sanctum')
        ->toContain('role:collector,admin');
});
