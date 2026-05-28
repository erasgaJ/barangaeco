<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('pending','resolved','rejected','cancelled') NOT NULL DEFAULT 'pending'");
        } elseif ($driver === 'sqlite') {
            $this->alterSqliteEnum(['pending', 'resolved', 'rejected', 'cancelled']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('pending','resolved','rejected') NOT NULL DEFAULT 'pending'");
        } elseif ($driver === 'sqlite') {
            $this->alterSqliteEnum(['pending', 'resolved', 'rejected']);
        }
    }

    /**
     * Recreate the document_requests table with an updated status CHECK constraint for SQLite.
     *
     * @param  array<string>  $allowedValues
     */
    private function alterSqliteEnum(array $allowedValues): void
    {
        $quoted = implode(', ', array_map(fn ($v) => "'$v'", $allowedValues));

        Schema::disableForeignKeyConstraints();

        DB::statement('CREATE TABLE document_requests_new AS SELECT * FROM document_requests');

        DB::statement('DROP TABLE document_requests');

        DB::statement("
            CREATE TABLE document_requests (
                id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                resident_id integer NOT NULL,
                document_type varchar NOT NULL,
                purpose varchar NOT NULL,
                reason text NOT NULL,
                status varchar CHECK(status IN ({$quoted})) NOT NULL DEFAULT 'pending',
                admin_remarks text,
                rejection_feedback text,
                resolved_at datetime,
                resolved_by integer,
                created_at datetime,
                updated_at datetime,
                FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
                FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
            )
        ");

        DB::statement('INSERT INTO document_requests SELECT * FROM document_requests_new');

        DB::statement('DROP TABLE document_requests_new');

        Schema::enableForeignKeyConstraints();
    }
};
