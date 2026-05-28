<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\CollectorController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DocumentRequestController;
use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Admin\WasteCollectionScheduleController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\Resident\AnnouncementController as ResidentAnnouncementController;
use App\Http\Controllers\Resident\ComplaintController as ResidentComplaintController;
use App\Http\Controllers\Resident\DashboardController as ResidentDashboardController;
use App\Http\Controllers\Resident\DocumentRequestController as ResidentDocumentRequestController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::view('api/documentation', 'swagger')->name('api.documentation');
Route::get('api/documentation/openapi.json', function () {
    return response()->file(base_path('openapi.json'), [
        'Content-Type' => 'application/json',
    ]);
})->name('api.documentation.openapi');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    // Residents
    Route::get('residents', [ResidentController::class, 'index'])->name('residents.index');
    Route::post('residents', [ResidentController::class, 'store'])->name('residents.store');
    Route::put('residents/{resident}', [ResidentController::class, 'update'])->name('residents.update');
    Route::delete('residents/{resident}', [ResidentController::class, 'destroy'])->name('residents.destroy');

    // Waste Management
    Route::prefix('waste-management')->name('waste.')->group(function () {
        Route::get('schedules', [WasteCollectionScheduleController::class, 'index'])->name('schedules.index');
        Route::post('schedules', [WasteCollectionScheduleController::class, 'store'])->name('schedules.store');
        Route::put('schedules/{schedule}', [WasteCollectionScheduleController::class, 'update'])->name('schedules.update');
        Route::delete('schedules/{schedule}', [WasteCollectionScheduleController::class, 'destroy'])->name('schedules.destroy');

        Route::get('collectors', [CollectorController::class, 'index'])->name('collectors.index');
        Route::post('collectors', [CollectorController::class, 'store'])->name('collectors.store');
        Route::put('collectors/{collector}', [CollectorController::class, 'update'])->name('collectors.update');
        Route::delete('collectors/{collector}', [CollectorController::class, 'destroy'])->name('collectors.destroy');
    });

    // Document Requests
    Route::get('document-requests', [DocumentRequestController::class, 'index'])->name('document-requests.index');
    Route::post('document-requests/{documentRequest}/approve', [DocumentRequestController::class, 'approve'])->name('document-requests.approve');
    Route::post('document-requests/{documentRequest}/reject', [DocumentRequestController::class, 'reject'])->name('document-requests.reject');

    // Complaints
    Route::get('complaints', [ComplaintController::class, 'index'])->name('complaints.index');
    Route::post('complaints', [ComplaintController::class, 'store'])->name('complaints.store');
    Route::patch('complaints/{complaint}/status', [ComplaintController::class, 'updateStatus'])->name('complaints.update-status');

    // Announcements
    Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // Zones
    Route::get('zones', [ZoneController::class, 'index'])->name('zones.index');
    Route::post('zones', [ZoneController::class, 'store'])->name('zones.store');
    Route::put('zones/{zone}', [ZoneController::class, 'update'])->name('zones.update');
    Route::delete('zones/{zone}', [ZoneController::class, 'destroy'])->name('zones.destroy');
});

// Resident routes
Route::middleware(['auth', 'verified', 'role:resident'])->prefix('resident')->name('resident.')->group(function () {
    Route::get('dashboard', ResidentDashboardController::class)->name('dashboard');
    Route::get('document-requests', [ResidentDocumentRequestController::class, 'index'])->name('document-requests.index');
    Route::post('document-requests', [ResidentDocumentRequestController::class, 'store'])->name('document-requests.store');
    Route::delete('document-requests/{documentRequest}', [ResidentDocumentRequestController::class, 'cancel'])->name('document-requests.cancel');
    Route::get('complaints', [ResidentComplaintController::class, 'index'])->name('complaints.index');
    Route::post('complaints', [ResidentComplaintController::class, 'store'])->name('complaints.store');
    Route::delete('complaints/{complaint}', [ResidentComplaintController::class, 'cancel'])->name('complaints.cancel');
    Route::get('announcements', [ResidentAnnouncementController::class, 'index'])->name('announcements.index');
});

require __DIR__.'/settings.php';
