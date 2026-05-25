<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'resident_id',
    'zone_id',
    'complaint_type',
    'complaint_against',
    'description',
    'priority',
    'status',
    'created_by',
])]
class Complaint extends Model
{
    use HasFactory;

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
