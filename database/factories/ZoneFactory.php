<?php

namespace Database\Factories;

use App\Models\Zone;
use App\Support\PhilippineData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Zone>
 */
class ZoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $counter = 0;
        $names = PhilippineData::zoneNames();
        $name = $names[$counter % count($names)];
        if ($counter >= count($names)) {
            $name .= ' '.(floor($counter / count($names)) + 1);
        }
        $counter++;

        return [
            'name' => $name,
            'description' => $this->faker->optional()->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the zone is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
