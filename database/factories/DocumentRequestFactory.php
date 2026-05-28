<?php

namespace Database\Factories;

use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Support\PhilippineData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentRequest>
 */
class DocumentRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'resident_id' => Resident::factory(),
            'document_type' => fake()->randomElement([
                'barangay_clearance',
                'certificate_of_residency',
                'indigency_certificate',
                'business_permit',
                'good_moral_certificate',
                'death_certificate_endorsement',
            ]),
            'purpose' => fake()->randomElement(PhilippineData::documentPurposes()),
            'reason' => fake()->randomElement(PhilippineData::documentReasons()),
            'status' => 'pending',
            'admin_remarks' => null,
            'rejection_feedback' => null,
            'resolved_at' => null,
            'resolved_by' => null,
        ];
    }

    /** Set status to pending. */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'admin_remarks' => null,
            'rejection_feedback' => null,
            'resolved_at' => null,
            'resolved_by' => null,
        ]);
    }

    /** Set status to resolved. */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    /** Set status to rejected. */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_feedback' => fake()->paragraph(),
            'resolved_at' => now(),
        ]);
    }

    /** Set status to cancelled. */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'admin_remarks' => null,
            'rejection_feedback' => null,
            'resolved_at' => null,
            'resolved_by' => null,
        ]);
    }
}
