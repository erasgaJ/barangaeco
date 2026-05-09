<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_collector', function (Blueprint $table) {
            $table->foreignId('waste_collection_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collector_id')->constrained()->cascadeOnDelete();
            $table->primary(['waste_collection_schedule_id', 'collector_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_collector');
    }
};
