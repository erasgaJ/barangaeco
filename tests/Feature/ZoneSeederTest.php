<?php

use App\Support\PhilippineData;
use Database\Seeders\ZoneSeeder;
use Illuminate\Support\Facades\DB;

test('ZoneSeeder creates exactly 5 zones with Philippine named zones', function () {
    $this->seed(ZoneSeeder::class);

    expect(DB::table('zones')->count())->toBe(5);

    $names = PhilippineData::zoneNames();
    foreach ($names as $name) {
        expect(DB::table('zones')->where('name', $name)->exists())->toBeTrue();
    }
});

test('ZoneSeeder is idempotent when run twice', function () {
    $this->seed(ZoneSeeder::class);
    $this->seed(ZoneSeeder::class);

    expect(DB::table('zones')->count())->toBe(5);
});
