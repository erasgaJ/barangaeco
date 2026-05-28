<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use App\Support\PhilippineData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $index = rand(0, count(PhilippineData::announcementTitles()) - 1);

        return [
            'created_by' => User::factory()->admin(),
            'title' => PhilippineData::announcementTitles()[$index],
            'message' => PhilippineData::announcementMessages()[$index],
            'target_audience' => fake()->randomElement(['all', 'residents', 'collectors']),
            'scheduled_at' => null,
            'published_at' => now(),
        ];
    }

    /** Announcement not yet published, just scheduled. */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => null,
            'scheduled_at' => now()->addDay(),
        ]);
    }

    /** Announcement published but targeted exclusively to collectors. */
    public function collectorsOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'target_audience' => 'collectors',
            'published_at' => now(),
        ]);
    }
}
