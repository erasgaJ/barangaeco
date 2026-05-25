<?php

use Database\Seeders\ZoneSeeder;
use Illuminate\Support\Facades\DB;

test('ZoneSeeder creates exactly 5 zones with names Zone 1 through Zone 5', function () {
    $this->seed(ZoneSeeder::class);

    expect(DB::table('zones')->count())->toBe(5);

    foreach (range(1, 5) as $number) {
        expect(DB::table('zones')->where('name', "Zone {$number}")->exists())->toBeTrue();
    }
});

test('ZoneSeeder is idempotent when run twice', function () {
    $this->seed(ZoneSeeder::class);
    $this->seed(ZoneSeeder::class);

    expect(DB::table('zones')->count())->toBe(5);
});
