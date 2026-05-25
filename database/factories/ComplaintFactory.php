<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Complaint>
 */
class ComplaintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'resident_id' => null,
            'zone_id' => Zone::factory(),
            'complaint_type' => fake()->randomElement(['Road', 'Noise', 'Environment', 'Infrastructure', 'Other']),
            'complaint_against' => fake()->name(),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'status' => 'open',
            'created_by' => User::factory(),
        ];
    }
}
