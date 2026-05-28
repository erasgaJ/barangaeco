<?php

namespace App\Http\Controllers\Api\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereIn('target_audience', ['all', 'residents'])
            ->latest('published_at')
            ->paginate(15);

        return response()->json($announcements);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        if ($announcement->published_at === null || $announcement->published_at->isFuture()) {
            abort(403);
        }

        if ($announcement->target_audience === 'collectors') {
            abort(403);
        }

        return response()->json($announcement);
    }
}
