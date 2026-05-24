<?php

use App\Models\DocumentRequest;
use App\Models\User;

it('approves a document request with admin remarks', function () {
    $admin = User::factory()->admin()->create();
    $request = DocumentRequest::factory()->pending()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.document-requests.approve', $request), [
            'admin_remarks' => 'Looks good.',
        ]);

    $response->assertRedirect(route('admin.document-requests.index'));
    expect($request->fresh()->status)->toBe('resolved');
    expect($request->fresh()->admin_remarks)->toBe('Looks good.');
});

it('approves a document request without admin remarks', function () {
    $admin = User::factory()->admin()->create();
    $request = DocumentRequest::factory()->pending()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.document-requests.approve', $request));

    $response->assertRedirect(route('admin.document-requests.index'));
    expect($request->fresh()->status)->toBe('resolved');
});

it('rejects unauthenticated approve attempt', function () {
    $request = DocumentRequest::factory()->pending()->create();

    $this->post(route('admin.document-requests.approve', $request))
        ->assertRedirect(route('login'));
});
