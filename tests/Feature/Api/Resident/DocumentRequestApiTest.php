<?php

use App\Models\Barangay;
use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function documentResidentWithToken(): array
{
    $barangay = Barangay::factory()->create();
    $user = User::factory()->resident()->create();
    $resident = Resident::factory()->create(['user_id' => $user->id, 'barangay_id' => $barangay->id]);
    $token = $user->createToken('Test Device')->plainTextToken;

    return [$user, $resident, $token];
}

// ─── index ────────────────────────────────────────────────────────────────────

it('lists only the authenticated resident own document requests', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    DocumentRequest::factory()->count(2)->create(['resident_id' => $resident->id]);

    // Another resident's request — must not appear in the response
    $otherResident = Resident::factory()->create();
    DocumentRequest::factory()->create(['resident_id' => $otherResident->id]);

    $response = $this->withToken($token)->getJson('/api/resident/document-requests');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveCount(2);
    foreach ($data as $item) {
        expect($item['id'])->not->toBe($otherResident->documentRequests()->first()?->id);
    }
});

it('returns 401 on index when unauthenticated', function () {
    $this->getJson('/api/resident/document-requests')->assertStatus(401);
});

// ─── store ────────────────────────────────────────────────────────────────────

it('stores a new document request and returns 201 with pending status', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $payload = [
        'document_type' => 'barangay_clearance',
        'purpose' => 'Employment',
        'reason' => 'I need this for my new job application.',
    ];

    $response = $this->withToken($token)->postJson('/api/resident/document-requests', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('document_type', 'barangay_clearance')
        ->assertJsonPath('purpose', 'Employment')
        ->assertJsonPath('status', 'pending');

    $this->assertDatabaseHas('document_requests', [
        'resident_id' => $resident->id,
        'document_type' => 'barangay_clearance',
        'status' => 'pending',
    ]);
});

it('returns 422 when document_type is missing on store', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $this->withToken($token)->postJson('/api/resident/document-requests', [
        'purpose' => 'Employment',
        'reason' => 'Needed for job.',
    ])->assertStatus(422)->assertJsonValidationErrors(['document_type']);
});

it('returns 422 when purpose is missing on store', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $this->withToken($token)->postJson('/api/resident/document-requests', [
        'document_type' => 'barangay_clearance',
        'reason' => 'Needed for job.',
    ])->assertStatus(422)->assertJsonValidationErrors(['purpose']);
});

it('returns 422 when reason is missing on store', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $this->withToken($token)->postJson('/api/resident/document-requests', [
        'document_type' => 'barangay_clearance',
        'purpose' => 'Employment',
    ])->assertStatus(422)->assertJsonValidationErrors(['reason']);
});

it('returns 401 on store when unauthenticated', function () {
    $this->postJson('/api/resident/document-requests', [
        'document_type' => 'barangay_clearance',
        'purpose' => 'Employment',
        'reason' => 'Needed for job.',
    ])->assertStatus(401);
});

// ─── show ─────────────────────────────────────────────────────────────────────

it('returns the document request with resolved_by key on show', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $documentRequest = DocumentRequest::factory()->create(['resident_id' => $resident->id]);

    $response = $this->withToken($token)->getJson("/api/resident/document-requests/{$documentRequest->id}");

    $response->assertStatus(200)
        ->assertJsonStructure(['id', 'document_type', 'purpose', 'reason', 'status', 'resolved_by']);
});

it('returns 403 when resident tries to show another residents document request', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $otherResident = Resident::factory()->create();
    $otherRequest = DocumentRequest::factory()->create(['resident_id' => $otherResident->id]);

    $this->withToken($token)->getJson("/api/resident/document-requests/{$otherRequest->id}")
        ->assertStatus(403);
});

it('returns 404 for a non-existent document request on show', function () {
    [$user, $resident, $token] = documentResidentWithToken();

    $this->withToken($token)->getJson('/api/resident/document-requests/99999')
        ->assertStatus(404);
});

it('returns 401 on show when unauthenticated', function () {
    $documentRequest = DocumentRequest::factory()->create();

    $this->getJson("/api/resident/document-requests/{$documentRequest->id}")
        ->assertStatus(401);
});
