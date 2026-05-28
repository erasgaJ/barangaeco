<?php

namespace App\Http\Controllers\Api\Collector;

use App\Http\Controllers\Controller;
use App\Models\CollectionStatusUpdate;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionStatusController extends Controller
{
    public function store(Request $request, WasteCollectionSchedule $schedule): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $collector = $request->user()->collector()->firstOrFail();

        abort_unless(
            $schedule->collectors()->where('collectors.id', $collector->id)->exists(),
            403
        );

        if ($schedule->status !== 'published') {
            return response()->json(['message' => 'Schedule is not published.'], 422);
        }

        $existingStatusUpdate = CollectionStatusUpdate::where('waste_collection_schedule_id', $schedule->id)
            ->where('collector_id', $collector->id)
            ->first();

        if ($existingStatusUpdate !== null && $existingStatusUpdate->status === 'completed' && $request->status !== 'completed') {
            return response()->json(['message' => 'Cannot revert a completed status.'], 422);
        }

        $statusUpdate = CollectionStatusUpdate::updateOrCreate(
            [
                'waste_collection_schedule_id' => $schedule->id,
                'collector_id' => $collector->id,
            ],
            [
                'status' => $request->status,
                'notes' => $request->notes,
            ]
        );

        return response()->json($statusUpdate, 201);
    }
}
