<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'full_name', 'contact_number'])]
class Collector extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedules(): BelongsToMany
    {
        return $this->belongsToMany(WasteCollectionSchedule::class, 'schedule_collector');
    }

    public function statusUpdates(): HasMany
    {
        return $this->hasMany(CollectionStatusUpdate::class);
    }
}
