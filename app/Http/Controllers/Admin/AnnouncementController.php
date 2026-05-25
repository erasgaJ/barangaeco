<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/announcements/index', [
            'announcements' => Announcement::with('createdBy')
                ->latest()
                ->paginate(20),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'target_audience' => ['required', 'in:all,residents,collectors'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'target_audience' => $request->target_audience,
            'scheduled_at' => $request->scheduled_at,
            'published_at' => $request->scheduled_at ? null : now(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.announcements.index');
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'target_audience' => ['required', 'in:all,residents,collectors'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $announcement->update([
            'title' => $request->title,
            'message' => $request->message,
            'target_audience' => $request->target_audience,
            'scheduled_at' => $request->scheduled_at,
        ]);

        return redirect()->route('admin.announcements.index');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('admin.announcements.index');
    }
}
