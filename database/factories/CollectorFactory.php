<?php

namespace Database\Factories;

use App\Models\Collector;
use App\Models\User;
use App\Support\PhilippineData;
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
        $user = User::factory()->collector();

        return [
            'user_id' => $user,
            'full_name' => fn (array $attributes) => User::find($attributes['user_id'])->name,
            'contact_number' => PhilippineData::mobileNumber(),
        ];
    }
}
