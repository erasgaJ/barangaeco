<?php

namespace Database\Seeders;

use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (DocumentRequest::count() >= 100) {
            return;
        }

        $adminId = User::where('role', 'admin')->first()->id;
        $residentIds = Resident::pluck('id')->toArray();

        // Target: 100 requests
        // 30 pending, 40 resolved, 20 rejected, 10 cancelled
        $distributions = [
            'pending' => 30,
            'resolved' => 40,
            'rejected' => 20,
            'cancelled' => 10,
        ];

        foreach ($distributions as $status => $count) {
            DocumentRequest::factory()->count($count)->create([
                'status' => $status,
                'resident_id' => fn () => fake()->randomElement($residentIds),
                'resolved_by' => in_array($status, ['resolved', 'rejected']) ? $adminId : null,
                'resolved_at' => in_array($status, ['resolved', 'rejected']) ? now()->subDays(rand(1, 30)) : null,
                'rejection_feedback' => ($status === 'rejected') ? 'Hindi kumpleto ang mga dokumento na isinumite. Pakiusap na magbigay ng valid ID.' : null,
                'admin_remarks' => ($status === 'resolved') ? 'Dokumento ay handa na para sa pickup.' : null,
            ]);
        }
    }
}
