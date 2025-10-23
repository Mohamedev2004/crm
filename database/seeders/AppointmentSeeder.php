<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        // Create 100 fake appointments
        Appointment::factory()->count(100)->create();
    }
}
