<?php

use Illuminate\Support\Facades\Schema;

test('complaints table has zone_id column', function () {
    expect(Schema::hasColumn('complaints', 'zone_id'))->toBeTrue();
});

test('complaints table does not have barangay_id column', function () {
    expect(Schema::hasColumn('complaints', 'barangay_id'))->toBeFalse();
});
