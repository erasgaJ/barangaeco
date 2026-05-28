<?php

namespace App\Http\Controllers\Api\Resident;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $resident = $request->user()->resident()->firstOrFail();

        $complaints = $resident->complaints()
            ->with('zone')
            ->latest()
            ->paginate(15);

        return response()->json($complaints);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'zone_id' => ['nullable', 'exists:zones,id'],
            'complaint_type' => ['required', 'string', 'max:255'],
            'complaint_against' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        $resident = $request->user()->resident()->firstOrFail();

        $complaint = $resident->complaints()->create([
            'zone_id' => $request->zone_id,
            'complaint_type' => $request->complaint_type,
            'complaint_against' => $request->complaint_against,
            'description' => $request->description,
            'priority' => 'low',
            'status' => 'open',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($complaint->load('zone'), 201);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $resident = $request->user()->resident()->firstOrFail();

        abort_unless($complaint->resident_id === $resident->id, 403);

        return response()->json($complaint->load('zone', 'createdBy'));
    }
}
