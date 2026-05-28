<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE complaints MODIFY COLUMN status ENUM('open', 'in_progress', 'resolved', 'cancelled') NOT NULL DEFAULT 'open'");
        } else {
            // For SQLite, we can't easily modify ENUM, but it's treated as string anyway.
            // However, we can re-create the table if needed, but usually string is enough for tests.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE complaints MODIFY COLUMN status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open'");
        }
    }
};
