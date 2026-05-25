<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('waste_collection_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('waste_collection_schedules', 'barangay_id')) {
                $table->dropForeign(['barangay_id']);
                $table->dropColumn('barangay_id');
            }
            if (! Schema::hasColumn('waste_collection_schedules', 'zone_id')) {
                $table->unsignedBigInteger('zone_id')->nullable()->after('id');
                $table->foreign('zone_id')->references('id')->on('zones')->nullOnDelete();
            }
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waste_collection_schedules', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
            $table->dropColumn('zone_id');
            $table->unsignedBigInteger('barangay_id')->after('id');
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();
        });
    }
};
