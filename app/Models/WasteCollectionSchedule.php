<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['barangay_id', 'scheduled_date', 'scheduled_time', 'status', 'created_by'])]
class WasteCollectionSchedule extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function collectors(): BelongsToMany
    {
        return $this->belongsToMany(Collector::class, 'schedule_collector');
    }

    public function statusUpdates(): HasMany
    {
        return $this->hasMany(CollectionStatusUpdate::class);
    }
}
