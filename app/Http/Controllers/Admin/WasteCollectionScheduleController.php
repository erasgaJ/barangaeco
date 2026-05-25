<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collector;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WasteCollectionScheduleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/waste-management/schedules', [
            'schedules' => WasteCollectionSchedule::with('zone', 'collectors')
                ->orderBy('scheduled_date', 'asc')
                ->get(),
            'today_schedules' => WasteCollectionSchedule::where('scheduled_date', today())
                ->where('status', 'published')
                ->with('zone', 'collectors', 'statusUpdates')
                ->get(),
            'zones' => Zone::where('is_active', true)->get(['id', 'name']),
            'collectors' => Collector::with('user')->orderBy('full_name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'zone_id' => ['nullable', 'exists:zones,id'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'collector_ids' => ['required', 'array', 'min:1'],
            'collector_ids.*' => ['exists:collectors,id'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $schedule = WasteCollectionSchedule::create([
            'zone_id' => $request->zone_id,
            'scheduled_date' => $request->scheduled_date,
            'scheduled_time' => $request->scheduled_time,
            'status' => $request->status,
            'created_by' => auth()->id(),
        ]);

        $schedule->collectors()->sync($request->collector_ids);

        return redirect()->route('admin.waste.schedules.index');
    }

    public function update(Request $request, WasteCollectionSchedule $schedule): RedirectResponse
    {
        $request->validate([
            'zone_id' => ['nullable', 'exists:zones,id'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'collector_ids' => ['required', 'array', 'min:1'],
            'collector_ids.*' => ['exists:collectors,id'],
            'status' => ['required', 'in:draft,published,completed,cancelled'],
        ]);

        $schedule->update($request->only('zone_id', 'scheduled_date', 'scheduled_time', 'status'));
        $schedule->collectors()->sync($request->collector_ids);

        return redirect()->route('admin.waste.schedules.index');
    }

    public function destroy(WasteCollectionSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('admin.waste.schedules.index');
    }
}
