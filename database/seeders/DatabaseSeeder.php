<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            BarangaySeeder::class,
            ZoneSeeder::class,
            CollectorSeeder::class,
            ResidentSeeder::class,
            WasteCollectionScheduleSeeder::class,
            DocumentRequestSeeder::class,
            ComplaintSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}
