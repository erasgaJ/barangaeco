<?php

namespace App\Models;

use Database\Factories\BarangayFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Barangay extends Model
{
    /** @use HasFactory<BarangayFactory> */
    use HasFactory;

    public function residents(): HasMany
    {
        return $this->hasMany(Resident::class);
    }

    public function wasteCollectionSchedules(): HasMany
    {
        return $this->hasMany(WasteCollectionSchedule::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }
}
