<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Report;
use App\Models\Patient;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        // Generate reports for existing patients
        Patient::all()->each(function ($patient) {
            // Each patient can have 1–3 reports
            Report::factory()->count(rand(1, 3))->create([
                'patient_id' => $patient->id,
            ]);
        });
    }
}