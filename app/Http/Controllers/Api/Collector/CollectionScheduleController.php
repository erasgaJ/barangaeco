<?php

namespace App\Http\Controllers\Api\Collector;

use App\Http\Controllers\Controller;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $collector = $request->user()->collector()->firstOrFail();

        $schedules = WasteCollectionSchedule::whereHas('collectors', function ($query) use ($collector) {
            $query->where('collectors.id', $collector->id);
        })
            ->where('status', 'published')
            ->orderBy('scheduled_date')
            ->with('barangay', 'statusUpdates')
            ->paginate(20);

        return response()->json($schedules);
    }

    public function show(Request $request, WasteCollectionSchedule $schedule): JsonResponse
    {
        $collector = $request->user()->collector()->firstOrFail();

        abort_unless(
            $schedule->collectors()->where('collectors.id', $collector->id)->exists(),
            403
        );

        return response()->json(
            $schedule->load('barangay', 'collectors', 'statusUpdates')
        );
    }
}
