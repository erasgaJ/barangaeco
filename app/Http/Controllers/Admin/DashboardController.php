<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\WasteCollectionSchedule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $todaySchedules = WasteCollectionSchedule::where('scheduled_date', today())
            ->where('status', 'published')
            ->with('barangay', 'collectors', 'statusUpdates')
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_residents' => Resident::count(),
                'pending_document_requests' => DocumentRequest::where('status', 'pending')->count(),
                'active_routes' => $todaySchedules->count(),
                'open_complaints' => Complaint::where('status', 'open')->count(),
            ],
            'recent_document_requests' => DocumentRequest::with('resident.barangay')
                ->latest()
                ->limit(5)
                ->get(),
            'today_schedules' => $todaySchedules,
        ]);
    }
}
