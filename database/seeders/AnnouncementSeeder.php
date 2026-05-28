<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Announcement::count() >= 25) {
            return;
        }

        $adminId = User::where('role', 'admin')->first()->id;

        // Create 25 announcements via factory
        // ~80% published, ~20% scheduled
        Announcement::factory()->count(20)->create([
            'created_by' => $adminId,
            'published_at' => now()->subDays(rand(1, 60)),
            'scheduled_at' => null,
        ]);

        Announcement::factory()->count(5)->create([
            'created_by' => $adminId,
            'published_at' => null,
            'scheduled_at' => now()->addDays(rand(1, 14)),
        ]);
    }
}
