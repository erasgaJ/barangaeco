<?php

namespace App\Http\Controllers\Api\Resident;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $resident = $request->user()->resident()->firstOrFail();

        $requests = $resident->documentRequests()
            ->latest()
            ->paginate(15);

        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string'],
        ]);

        $resident = $request->user()->resident()->firstOrFail();

        $documentRequest = $resident->documentRequests()->create([
            'document_type' => $request->document_type,
            'purpose' => $request->purpose,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json($documentRequest, 201);
    }

    public function show(Request $request, DocumentRequest $documentRequest): JsonResponse
    {
        $resident = $request->user()->resident()->firstOrFail();

        abort_unless($documentRequest->resident_id === $resident->id, 403);

        return response()->json($documentRequest->load('resolvedBy'));
    }

    public function cancel(Request $request, DocumentRequest $documentRequest): JsonResponse
    {
        $resident = $request->user()->resident()->firstOrFail();

        abort_unless($documentRequest->resident_id === $resident->id, 403);

        if ($documentRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be cancelled.'], 422);
        }

        $documentRequest->update(['status' => 'cancelled']);

        return response()->json(['data' => $documentRequest], 200);
    }
}
