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
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
            'notes' => fake()->boolean(70) ? fake()->randomElement(PhilippineData::collectionNotes()) : null,
        ];
    }
}
