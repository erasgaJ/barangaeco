<?php

namespace App\Http\Controllers\Api\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResidentDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $resident = $request->user()->resident()->with('barangay')->firstOrFail();

        $todaySchedule = WasteCollectionSchedule::where('barangay_id', $resident->barangay_id)
            ->where('scheduled_date', today())
            ->where('status', 'published')
            ->with('collectors')
            ->first();

        $pendingDocumentRequests = $resident->documentRequests()
            ->where('status', 'pending')
            ->count();

        $openComplaints = $resident->complaints()
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        $announcements = Announcement::where(function ($query) {
            $query->where('target_audience', 'all')
                ->orWhere('target_audience', 'residents');
        })
            ->whereNotNull('published_at')
            ->latest('published_at')
            ->limit(5)
            ->get();

        return response()->json([
            'resident' => $resident,
            'today_schedule' => $todaySchedule,
            'pending_document_requests' => $pendingDocumentRequests,
            'open_complaints' => $openComplaints,
            'announcements' => $announcements,
        ]);
    }
}
