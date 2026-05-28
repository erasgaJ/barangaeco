<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\User;
use App\Models\Zone;
use App\Support\PhilippineData;
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
            'complaint_type' => ['Road', 'Noise', 'Environment', 'Infrastructure', 'Other'][array_rand(['Road', 'Noise', 'Environment', 'Infrastructure', 'Other'])],
            'complaint_against' => PhilippineData::complaintAgainst()[array_rand(PhilippineData::complaintAgainst())],
            'description' => PhilippineData::complaintDescriptions()[array_rand(PhilippineData::complaintDescriptions())],
            'priority' => ['low', 'medium', 'high'][array_rand(['low', 'medium', 'high'])],
            'status' => 'open',
            'created_by' => User::factory(),
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'cancelled']);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'in_progress']);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'resolved']);
    }
}
