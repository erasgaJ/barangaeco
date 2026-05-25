<?php

use App\Models\Complaint;
use App\Models\User;

it('allows admin to update complaint status', function () {
    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create(['status' => 'open']);

    $response = $this->actingAs($admin)
        ->patch(route('admin.complaints.update-status', $complaint), [
            'status' => 'in_progress',
        ]);

    $response->assertRedirect(route('admin.complaints.index'));
    expect($complaint->fresh()->status)->toBe('in_progress');
});

it('rejects invalid status value', function () {
    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.complaints.update-status', $complaint), [
            'status' => 'invalid_status',
        ])
        ->assertSessionHasErrors('status');
});

it('rejects unauthenticated status update', function () {
    $complaint = Complaint::factory()->create();
    $this->patch(route('admin.complaints.update-status', $complaint), ['status' => 'open'])
        ->assertRedirect(route('login'));
});
