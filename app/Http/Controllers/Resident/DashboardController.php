<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $resident = $user->resident;

        if (! $resident) {
            return redirect()->route('dashboard')->with('error', 'No resident record found for your account.');
        }

        $pendingDocumentRequests = $resident->documentRequests()
            ->where('status', 'pending')
            ->count();

        $openComplaints = $resident->complaints()
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        $todaySchedule = WasteCollectionSchedule::where('scheduled_date', today())
            ->where('status', 'published')
            ->with(['collectors', 'statusUpdates' => fn ($q) => $q->latest()])
            ->first();

        $announcements = Announcement::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereIn('target_audience', ['all', 'residents'])
            ->latest('published_at')
            ->take(5)
            ->get(['id', 'title', 'message', 'published_at']);

        return Inertia::render('resident/dashboard', [
            'resident' => $resident->only(['id', 'full_name', 'barangay_id']),
            'pending_document_requests' => $pendingDocumentRequests,
            'open_complaints' => $openComplaints,
            'today_schedule' => $todaySchedule ? [
                'id' => $todaySchedule->id,
                'scheduled_time' => $todaySchedule->scheduled_time,
                'status' => $todaySchedule->statusUpdates->first()?->status ?? 'pending',
            ] : null,
            'announcements' => $announcements,
        ]);
    }
}
