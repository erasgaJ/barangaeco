<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'resident_id',
    'document_type',
    'purpose',
    'reason',
    'status',
    'admin_remarks',
    'rejection_feedback',
    'resolved_at',
    'resolved_by',
])]
class DocumentRequest extends Model
{
    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
