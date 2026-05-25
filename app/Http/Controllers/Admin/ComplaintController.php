<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Complaint::with('resident', 'zone', 'createdBy')->latest();

        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('complaint_type')) {
            $query->where('complaint_type', $request->complaint_type);
        }

        return Inertia::render('admin/complaints/index', [
            'complaints' => $query->paginate(20)->withQueryString(),
            'zones' => Zone::where('is_active', true)->get(['id', 'name']),
            'filters' => $request->only('zone_id', 'priority', 'complaint_type'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'resident_id' => ['nullable', 'exists:residents,id'],
            'zone_id' => ['nullable', 'exists:zones,id'],
            'complaint_type' => ['required', 'string', 'max:255'],
            'complaint_against' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
        ]);

        Complaint::create([
            'resident_id' => $request->resident_id,
            'zone_id' => $request->zone_id,
            'complaint_type' => $request->complaint_type,
            'complaint_against' => $request->complaint_against,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => 'open',
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.complaints.index');
    }

    public function updateStatus(Request $request, Complaint $complaint): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved'],
        ]);

        $complaint->update(['status' => $request->status]);

        return redirect()->route('admin.complaints.index');
    }
}
