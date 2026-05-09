<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collector;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/waste-management/collectors', [
            'collectors' => Collector::with('user')->latest()->paginate(20),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('password'),
            'role' => 'collector',
        ]);

        $user->collector()->create([
            'full_name' => $request->full_name,
            'contact_number' => $request->contact_number,
        ]);

        return redirect()->route('admin.collectors.index');
    }

    public function update(Request $request, Collector $collector): RedirectResponse
    {
        $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string'],
        ]);

        $collector->update($request->only('full_name', 'contact_number'));

        return redirect()->route('admin.collectors.index');
    }

    public function destroy(Collector $collector): RedirectResponse
    {
        $user = $collector->user;
        $collector->delete();
        $user->delete();

        return redirect()->route('admin.collectors.index');
    }
}
