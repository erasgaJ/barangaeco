<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (range(1, 5) as $number) {
            Zone::firstOrCreate(
                ['name' => "Zone {$number}"],
                ['description' => null, 'is_active' => true],
            );
        }
    }
}
