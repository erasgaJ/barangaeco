<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\Resident;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Complaint::count() >= 150) {
            return;
        }

        $adminId = User::where('role', 'admin')->first()->id;
        $zoneIds = Zone::pluck('id')->toArray();
        $residentIds = Resident::pluck('id')->toArray();

        // Target: 150 complaints
        // 60 open, 45 in_progress, 30 resolved, 15 cancelled
        $distributions = [
            'open' => 60,
            'in_progress' => 45,
            'resolved' => 30,
            'cancelled' => 15,
        ];

        foreach ($distributions as $status => $count) {
            Complaint::factory()->count($count)->create([
                'status' => $status,
                'zone_id' => fn () => fake()->randomElement($zoneIds),
                'resident_id' => fn () => (rand(1, 100) > 20) ? fake()->randomElement($residentIds) : null,
                'created_by' => $adminId,
            ]);
        }
    }
}
