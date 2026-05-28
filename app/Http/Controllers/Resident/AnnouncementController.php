<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereIn('target_audience', ['all', 'residents'])
            ->latest('published_at')
            ->paginate(15);

        return Inertia::render('resident/announcements/index', [
            'announcements' => $announcements,
        ]);
    }
}
