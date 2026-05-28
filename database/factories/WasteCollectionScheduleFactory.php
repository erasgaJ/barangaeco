<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
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
            'zone_id' => Zone::factory(),
            'scheduled_date' => now()->addDays(rand(0, 30))->format('Y-m-d'),
            'scheduled_time' => ['06:00', '07:00', '08:00', '14:00', '15:00'][array_rand(['06:00', '07:00', '08:00', '14:00', '15:00'])],
            'status' => ['draft', 'published'][array_rand(['draft', 'published'])],
            'created_by' => User::factory()->admin(),
        ];
    }
}
