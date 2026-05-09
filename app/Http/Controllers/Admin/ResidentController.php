<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ResidentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/residents/index', [
            'residents' => Resident::with('barangay', 'user')
                ->latest()
                ->paginate(20),
            'barangays' => Barangay::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'full_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'contact_number' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('password'),
            'role' => 'resident',
        ]);

        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('resident-photos', 'public')
            : null;

        $user->resident()->create([
            'barangay_id' => $request->barangay_id,
            'full_name' => $request->full_name,
            'address' => $request->address,
            'contact_number' => $request->contact_number,
            'photo' => $photoPath,
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        return redirect()->route('admin.residents.index');
    }

    public function update(Request $request, Resident $resident): RedirectResponse
    {
        $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'contact_number' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            if ($resident->photo) {
                Storage::disk('public')->delete($resident->photo);
            }
            $resident->photo = $request->file('photo')->store('resident-photos', 'public');
        }

        $resident->fill($request->only('full_name', 'address', 'barangay_id', 'contact_number'));
        $resident->save();

        return redirect()->route('admin.residents.index');
    }

    public function destroy(Resident $resident): RedirectResponse
    {
        $user = $resident->user;
        $resident->delete();
        $user->delete();

        return redirect()->route('admin.residents.index');
    }
}
