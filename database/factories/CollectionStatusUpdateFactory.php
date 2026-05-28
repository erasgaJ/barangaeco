<?php

namespace Database\Factories;

use App\Models\CollectionStatusUpdate;
use App\Models\Collector;
use App\Models\WasteCollectionSchedule;
use App\Support\PhilippineData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CollectionStatusUpdate>
 */
class CollectionStatusUpdateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'waste_collection_schedule_id' => WasteCollectionSchedule::factory(),
            'collector_id' => Collector::factory(),
            'status' => ['pending', 'in_progress', 'completed'][array_rand(['pending', 'in_progress', 'completed'])],
            'notes' => (rand(1, 100) <= 70) ? PhilippineData::collectionNotes()[array_rand(PhilippineData::collectionNotes())] : null,
        ];
    }
}
