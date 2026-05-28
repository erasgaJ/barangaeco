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
        Schema::table('collection_status_updates', function (Blueprint $table) {
            $table->index(['waste_collection_schedule_id', 'collector_id'], 'csu_schedule_collector_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('collection_status_updates', function (Blueprint $table) {
            $table->dropIndex('csu_schedule_collector_index');
        });
    }
};
