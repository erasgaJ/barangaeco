<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response|RedirectResponse
    {
        if (auth()->user()->isResident()) {
            return redirect()->route('resident.dashboard');
        }

        $todaySchedules = WasteCollectionSchedule::where('scheduled_date', today())
            ->where('status', 'published')
            ->with('zone', 'collectors', 'statusUpdates')
            ->get();

        $todaySchedules = $todaySchedules->map(function ($schedule) {
            $latestUpdate = $schedule->statusUpdates->sortByDesc('updated_at')->first();

            return array_merge($schedule->toArray(), [
                'zone_name' => $schedule->zone?->name ?? 'Unknown Zone',
                'status_update' => $latestUpdate ? [
                    'status' => $latestUpdate->status,
                    'time' => $latestUpdate->updated_at->format('g:i A'),
                ] : null,
            ]);
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_residents' => Resident::count(),
                'pending_document_requests' => DocumentRequest::where('status', 'pending')->count(),
                'active_routes' => $todaySchedules->count(),
                'open_complaints' => Complaint::where('status', 'open')->count(),
                'residents_this_month' => Resident::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
            'recent_document_requests' => DocumentRequest::with('resident')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($req) => array_merge($req->toArray(), [
                    'resident_name' => $req->resident?->full_name ?? 'Unknown Resident',
                ])),
            'today_schedules' => $todaySchedules,
        ]);
    }
}
