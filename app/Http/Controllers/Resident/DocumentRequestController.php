<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident) {
            return redirect()->route('dashboard');
        }

        $requests = $resident->documentRequests()->latest()->paginate(20);

        return Inertia::render('resident/document-requests/index', [
            'requests' => $requests,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'document_type' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $resident->documentRequests()->create([
            ...$validated,
            'status' => 'pending',
        ]);

        return redirect()->route('resident.document-requests.index');
    }

    public function cancel(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $resident = $request->user()->resident;

        if (! $resident || $documentRequest->resident_id !== $resident->id) {
            abort(403);
        }

        if ($documentRequest->status !== 'pending') {
            abort(422, 'Only pending requests can be cancelled.');
        }

        $documentRequest->update(['status' => 'cancelled']);

        return back();
    }
}
