<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WasteCollectionSchedule>
 */
class WasteCollectionScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'barangay_id' => Barangay::factory(),
            'scheduled_date' => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'scheduled_time' => fake()->time('H:i'),
            'status' => fake()->randomElement(['draft', 'published']),
            'created_by' => User::factory()->admin(),
        ];
    }
}
