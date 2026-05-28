<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use App\Support\PhilippineData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Resident>
 */
class ResidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::factory()->resident();

        return [
            'user_id' => $user,
            'barangay_id' => Barangay::factory(),
            'full_name' => fn (array $attributes) => User::find($attributes['user_id'])->name,
            'address' => PhilippineData::address(),
            'contact_number' => PhilippineData::mobileNumber(),
            'photo' => null,
            'id_image' => null,
            'verification_status' => 'pending',
            'verified_at' => null,
            'verified_by' => null,
        ];
    }

    /** Set verification_status to pending. */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'pending',
            'verified_at' => null,
            'verified_by' => null,
        ]);
    }

    /** Set verification_status to verified. */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
    }

    /** Set verification_status to rejected. */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'rejected',
            'verified_at' => null,
            'verified_by' => null,
        ]);
    }
}
