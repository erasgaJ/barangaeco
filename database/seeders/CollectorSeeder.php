<?php

namespace Database\Seeders;

use App\Models\Collector;
use App\Models\User;
use App\Support\PhilippineData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CollectorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 20 realistic Filipino names
        $names = [
            'Juan Dela Cruz', 'Jose Rizal', 'Andres Bonifacio', 'Emilio Aguinaldo', 'Apolinario Mabini',
            'Manuel Quezon', 'Ramon Magsaysay', 'Diosdado Macapagal', 'Ferdinand Marcos', 'Corazon Aquino',
            'Fidel Ramos', 'Joseph Estrada', 'Gloria Arroyo', 'Benigno Aquino', 'Rodrigo Duterte',
            'Bongbong Marcos', 'Leni Robredo', 'Sara Duterte', 'Isko Moreno', 'Manny Pacquiao',
        ];

        foreach ($names as $name) {
            $email = Str::slug($name, '.').'@collector.ph';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => 'collector',
                    'email_verified_at' => now(),
                ]
            );

            Collector::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $name,
                    'contact_number' => PhilippineData::mobileNumber(),
                ]
            );
        }
    }
}
