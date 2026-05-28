<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Collector\CollectionScheduleController;
use App\Http\Controllers\Api\Collector\CollectionStatusController;
use App\Http\Controllers\Api\Collector\CollectorDashboardController;
use App\Http\Controllers\Api\Resident\AnnouncementController as ResidentAnnouncementController;
use App\Http\Controllers\Api\Resident\ComplaintController as ResidentComplaintController;
use App\Http\Controllers\Api\Resident\DocumentRequestController as ResidentDocumentRequestController;
use App\Http\Controllers\Api\Resident\ResidentDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile API Routes
|--------------------------------------------------------------------------
| All routes use Sanctum token authentication (auth:sanctum).
| Role enforcement is handled by the 'role' middleware.
*/

Route::prefix('auth')->group(function () {
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

// Resident mobile routes
Route::middleware(['auth:sanctum', 'role:resident,admin'])->prefix('resident')->group(function () {
    Route::get('dashboard', ResidentDashboardController::class);

    Route::apiResource('document-requests', ResidentDocumentRequestController::class)
        ->only(['index', 'store', 'show']);

    Route::patch('document-requests/{documentRequest}/cancel', [ResidentDocumentRequestController::class, 'cancel']);

    Route::apiResource('complaints', ResidentComplaintController::class)
        ->only(['index', 'store', 'show']);

    Route::apiResource('announcements', ResidentAnnouncementController::class)
        ->only(['index', 'show']);
});

// Collector/staff mobile routes
Route::middleware(['auth:sanctum', 'role:collector,admin'])->prefix('collector')->group(function () {
    Route::get('dashboard', CollectorDashboardController::class);

    Route::get('schedules', [CollectionScheduleController::class, 'index']);
    Route::get('schedules/{schedule}', [CollectionScheduleController::class, 'show']);

    Route::post('schedules/{schedule}/status', [CollectionStatusController::class, 'store']);
});
