<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Resident;
use App\Models\User;
use App\Support\PhilippineData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangay = Barangay::first();
        $admin = User::where('role', 'admin')->first();

        $firstNamesM = PhilippineData::firstNamesMale();
        $firstNamesF = PhilippineData::firstNamesFemale();
        $lastNames = PhilippineData::lastNames();

        $count = 0;
        $total = 100;

        // Generate 100 deterministic names
        for ($i = 0; $i < 10; $i++) {
            for ($j = 0; $j < 10; $j++) {
                if ($count >= $total) {
                    break;
                }

                $lastName = $lastNames[$i];
                $firstName = ($count % 2 === 0) ? $firstNamesM[$j] : $firstNamesF[$j];
                $name = "{$firstName} {$lastName}";
                $email = Str::slug($name, '.').$count.'@resident.ph';

                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => Hash::make('password'),
                        'role' => 'resident',
                        'email_verified_at' => now(),
                    ]
                );

                $status = 'verified';
                $verifiedAt = now()->subDays(rand(1, 90));
                $verifiedBy = $admin?->id;

                if ($count >= 70 && $count < 90) {
                    $status = 'pending';
                    $verifiedAt = null;
                    $verifiedBy = null;
                } elseif ($count >= 90) {
                    $status = 'rejected';
                    $verifiedAt = null;
                    $verifiedBy = null;
                }

                Resident::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'barangay_id' => $barangay->id,
                        'full_name' => $name,
                        'address' => PhilippineData::address(),
                        'contact_number' => PhilippineData::mobileNumber(),
                        'verification_status' => $status,
                        'verified_at' => $verifiedAt,
                        'verified_by' => $verifiedBy,
                    ]
                );

                $count++;
            }
        }
    }
}
