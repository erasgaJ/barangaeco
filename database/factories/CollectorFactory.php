<?php

namespace Database\Factories;

use App\Models\Collector;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Collector>
 */
class CollectorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->collector(),
            'full_name' => fake()->name(),
            'contact_number' => fake()->phoneNumber(),
        ];
    }
}
