<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DocumentRequest::with('resident.barangay', 'resolvedBy')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('admin/document-requests/index', [
            'requests' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('status'),
        ]);
    }

    public function approve(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $request->validate([
            'admin_remarks' => ['nullable', 'string'],
        ]);

        $documentRequest->update([
            'status' => 'resolved',
            'admin_remarks' => $request->admin_remarks,
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);

        return redirect()->route('admin.document-requests.index');
    }

    public function reject(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $request->validate([
            'rejection_feedback' => ['required', 'string'],
        ]);

        $documentRequest->update([
            'status' => 'rejected',
            'rejection_feedback' => $request->rejection_feedback,
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);

        return redirect()->route('admin.document-requests.index');
    }
}
