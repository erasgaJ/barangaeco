<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/zones/index', [
            'zones' => Zone::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:zones'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        Zone::create($request->only(['name', 'description', 'is_active']));

        return redirect()->route('admin.zones.index')->with('success', 'Zone created successfully.');
    }

    public function update(Request $request, Zone $zone): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:zones,name,'.$zone->id],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $zone->update($request->only(['name', 'description', 'is_active']));

        return redirect()->route('admin.zones.index')->with('success', 'Zone updated successfully.');
    }

    public function destroy(Zone $zone): RedirectResponse
    {
        $zone->delete();

        return redirect()->route('admin.zones.index')->with('success', 'Zone deleted successfully.');
    }
}
