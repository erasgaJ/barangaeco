<?php

namespace App\Http\Controllers\Api\Collector;

use App\Http\Controllers\Controller;
use App\Models\WasteCollectionSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectorDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $collector = $request->user()->collector()->firstOrFail();

        $todaySchedules = WasteCollectionSchedule::whereHas('collectors', function ($query) use ($collector) {
            $query->where('collectors.id', $collector->id);
        })
            ->where('scheduled_date', today())
            ->where('status', 'published')
            ->with('zone', 'statusUpdates')
            ->get();

        $upcomingSchedules = WasteCollectionSchedule::whereHas('collectors', function ($query) use ($collector) {
            $query->where('collectors.id', $collector->id);
        })
            ->where('scheduled_date', '>', today())
            ->where('status', 'published')
            ->orderBy('scheduled_date')
            ->limit(5)
            ->with('zone')
            ->get();

        return response()->json([
            'collector' => $collector,
            'today_schedules' => $todaySchedules,
            'upcoming_schedules' => $upcomingSchedules,
        ]);
    }
}
