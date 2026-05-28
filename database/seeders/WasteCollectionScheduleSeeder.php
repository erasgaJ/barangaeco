<?php

namespace Database\Seeders;

use App\Models\CollectionStatusUpdate;
use App\Models\Collector;
use App\Models\User;
use App\Models\WasteCollectionSchedule;
use App\Models\Zone;
use App\Support\PhilippineData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class WasteCollectionScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (WasteCollectionSchedule::count() >= 100) {
            return;
        }

        $adminId = User::where('role', 'admin')->first()->id;
        $zoneIds = Zone::pluck('id')->toArray();
        $collectorIds = Collector::pluck('id')->toArray();

        $startDate = Carbon::today()->subDays(60);

        for ($i = 0; $i < 100; $i++) {
            $date = $startDate->copy()->addDays($i);
            $zoneId = $zoneIds[$i % count($zoneIds)];
            $status = ($date->isPast() || $date->isToday()) ? 'published' : (rand(0, 1) ? 'published' : 'draft');

            $schedule = WasteCollectionSchedule::create([
                'zone_id' => $zoneId,
                'scheduled_date' => $date->format('Y-m-d'),
                'scheduled_time' => ['06:00', '07:00', '08:00', '14:00', '15:00'][array_rand(['06:00', '07:00', '08:00', '14:00', '15:00'])],
                'status' => $status,
                'created_by' => $adminId,
            ]);

            // Assign 1-3 collectors
            $numCollectors = rand(1, 3);
            $assignedCollectors = (array) array_rand(array_flip($collectorIds), $numCollectors);
            $schedule->collectors()->attach($assignedCollectors);

            if ($status === 'published') {
                $updateStatus = $date->isPast() ? (rand(0, 10) > 2 ? 'completed' : 'in_progress') : 'pending';
                $collectorId = $assignedCollectors[0];

                CollectionStatusUpdate::create([
                    'waste_collection_schedule_id' => $schedule->id,
                    'collector_id' => $collectorId,
                    'status' => $updateStatus,
                    'notes' => rand(0, 1) ? PhilippineData::collectionNotes()[array_rand(PhilippineData::collectionNotes())] : null,
                ]);
            }
        }
    }
}
