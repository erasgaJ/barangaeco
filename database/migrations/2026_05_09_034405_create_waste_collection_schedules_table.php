<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waste_collection_schedules', function (Blueprint $table) {
            $table->id();
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->enum('status', ['draft', 'published', 'completed', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waste_collection_schedules');
    }
};
