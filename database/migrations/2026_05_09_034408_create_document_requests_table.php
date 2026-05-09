<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('purpose');
            $table->text('reason');
            $table->enum('status', ['pending', 'resolved', 'rejected'])->default('pending');
            $table->text('admin_remarks')->nullable();
            $table->text('rejection_feedback')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
