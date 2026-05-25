<?php

use App\Models\Zone;
use Illuminate\Database\Eloquent\Relations\HasMany;

test('zone can be created via factory with expected attributes', function () {
    $zone = Zone::factory()->create([
        'name' => 'Zone Test Area',
        'description' => 'A test zone description.',
        'is_active' => true,
    ]);

    expect($zone->name)->toBe('Zone Test Area');
    expect($zone->description)->toBe('A test zone description.');
    expect($zone->is_active)->toBeTrue();
});

test('zone factory inactive state sets is_active to false', function () {
    $zone = Zone::factory()->inactive()->make();

    expect($zone->is_active)->toBeFalse();
});

test('zone has complaints relationship', function () {
    $zone = Zone::factory()->create();

    expect($zone->complaints())->toBeInstanceOf(HasMany::class);
});

test('zone has wasteCollectionSchedules relationship', function () {
    $zone = Zone::factory()->create();

    expect($zone->wasteCollectionSchedules())->toBeInstanceOf(HasMany::class);
});
