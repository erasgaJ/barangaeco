<?php

use Illuminate\Support\Facades\Schema;

test('waste_collection_schedules table has zone_id column', function () {
    expect(Schema::hasColumn('waste_collection_schedules', 'zone_id'))->toBeTrue();
});

test('waste_collection_schedules table does not have barangay_id column', function () {
    expect(Schema::hasColumn('waste_collection_schedules', 'barangay_id'))->toBeFalse();
});
