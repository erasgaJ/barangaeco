<?php

namespace Database\Seeders;

use App\Models\Zone;
use App\Support\PhilippineData;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = PhilippineData::zoneNames();
        $descriptions = PhilippineData::zoneDescriptions();

        foreach ($names as $index => $name) {
            Zone::firstOrCreate(
                ['name' => $name],
                [
                    'description' => $descriptions[$index],
                    'is_active' => true,
                ],
            );
        }
    }
}
