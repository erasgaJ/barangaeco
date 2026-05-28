<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident) {
            return redirect()->route('dashboard');
        }

        $complaints = $resident->complaints()->with('zone')->latest()->paginate(20);
        $zones = Zone::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('resident/complaints/index', [
            'complaints' => $complaints,
            'zones' => $zones,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'zone_id' => ['nullable', 'exists:zones,id'],
            'complaint_type' => ['required', 'string', 'max:255'],
            'complaint_against' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        Complaint::create([
            ...$validated,
            'resident_id' => $resident->id,
            'priority' => 'low',
            'status' => 'open',
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('resident.complaints.index');
    }

    public function cancel(Request $request, Complaint $complaint): RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident || $complaint->resident_id !== $resident->id) {
            abort(403);
        }

        if ($complaint->status !== 'open') {
            abort(422, 'Only open complaints can be cancelled.');
        }

        $complaint->update(['status' => 'cancelled']);

        return back();
    }
}
