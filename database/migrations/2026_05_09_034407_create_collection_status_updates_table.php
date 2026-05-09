<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_status_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('waste_collection_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collector_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_status_updates');
    }
};
