<?php

use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;

test('resident can view their document requests', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    DocumentRequest::factory()->count(3)->create(['resident_id' => $resident->id]);

    $this->actingAs($user)
        ->get('/resident/document-requests')
        ->assertInertia(
            fn ($page) => $page
                ->component('resident/document-requests/index')
                ->has('requests')
        );
});

test('resident cannot see another residents document requests', function () {
    $residentA = Resident::factory()->create();
    $userA = User::find($residentA->user_id);

    $residentB = Resident::factory()->create();
    $requestB = DocumentRequest::factory()->create(['resident_id' => $residentB->id]);

    $response = $this->actingAs($userA)
        ->get('/resident/document-requests');

    $response->assertInertia(
        fn ($page) => $page
            ->component('resident/document-requests/index')
            ->where('requests.data', fn ($data) => collect($data)->every(fn ($item) => $item['resident_id'] !== $residentB->id))
    );
});

test('resident can submit a document request', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $this->actingAs($user)
        ->post('/resident/document-requests', [
            'document_type' => 'barangay_clearance',
            'purpose' => 'Employment',
            'reason' => 'Required for job application',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'resident_id' => $resident->id,
        'document_type' => 'barangay_clearance',
        'purpose' => 'Employment',
        'reason' => 'Required for job application',
        'status' => 'pending',
    ]);
});

test('document request store validates required fields', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $this->actingAs($user)
        ->post('/resident/document-requests', [])
        ->assertSessionHasErrors(['document_type', 'purpose', 'reason']);
});

test('resident can cancel a pending document request', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $documentRequest = DocumentRequest::factory()->pending()->create([
        'resident_id' => $resident->id,
    ]);

    $this->actingAs($user)
        ->delete("/resident/document-requests/{$documentRequest->id}")
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'cancelled',
    ]);
});

test('resident cannot cancel a resolved document request', function () {
    $resident = Resident::factory()->create();
    $user = User::find($resident->user_id);

    $documentRequest = DocumentRequest::factory()->resolved()->create([
        'resident_id' => $resident->id,
    ]);

    $this->actingAs($user)
        ->delete("/resident/document-requests/{$documentRequest->id}")
        ->assertStatus(422);
});

test('resident cannot cancel another residents document request', function () {
    $residentA = Resident::factory()->create();
    $userA = User::find($residentA->user_id);

    $residentB = Resident::factory()->create();
    $documentRequest = DocumentRequest::factory()->pending()->create([
        'resident_id' => $residentB->id,
    ]);

    $this->actingAs($userA)
        ->delete("/resident/document-requests/{$documentRequest->id}")
        ->assertStatus(403);
});
