<?php

use App\Models\DocumentRequest;
use App\Models\User;

it('rejects a document request with feedback', function () {
    $admin = User::factory()->admin()->create();
    $request = DocumentRequest::factory()->pending()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.document-requests.reject', $request), [
            'rejection_feedback' => 'Missing required documents.',
        ]);

    $response->assertRedirect(route('admin.document-requests.index'));
    expect($request->fresh()->status)->toBe('rejected');
    expect($request->fresh()->rejection_feedback)->toBe('Missing required documents.');
});

it('requires rejection_feedback when rejecting', function () {
    $admin = User::factory()->admin()->create();
    $request = DocumentRequest::factory()->pending()->create();

    $this->actingAs($admin)
        ->post(route('admin.document-requests.reject', $request), [])
        ->assertSessionHasErrors('rejection_feedback');
});

it('rejects unauthenticated reject attempt', function () {
    $request = DocumentRequest::factory()->pending()->create();
    $this->post(route('admin.document-requests.reject', $request))
        ->assertRedirect(route('login'));
});
