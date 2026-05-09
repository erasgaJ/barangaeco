<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['waste_collection_schedule_id', 'collector_id', 'status', 'notes'])]
class CollectionStatusUpdate extends Model
{
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(WasteCollectionSchedule::class, 'waste_collection_schedule_id');
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(Collector::class);
    }
}
