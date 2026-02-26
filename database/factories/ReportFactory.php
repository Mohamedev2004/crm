<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Patient;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    protected $model = \App\Models\Report::class;

    public function definition(): array
    {
        $gestationalAge = $this->faker->numberBetween(1, 40);
        $lastMenstrualPeriod = $this->faker->dateTimeBetween('-10 months', 'now');
        $expectedDelivery = (clone $lastMenstrualPeriod)->modify('+280 days');

        return [
            'patient_id' => Patient::factory(), // create a patient automatically
            'gestational_age_weeks' => $gestationalAge,
            'last_menstrual_period' => $lastMenstrualPeriod,
            'expected_delivery_date' => $expectedDelivery,

            'weight' => $this->faker->randomFloat(2, 45, 120),
            'blood_pressure' => $this->faker->numberBetween(90, 140) . '/' . $this->faker->numberBetween(60, 90),
            'fetal_heart_rate' => $this->faker->numberBetween(110, 180),
            'uterine_height' => $this->faker->optional()->numberBetween(20, 45),

            'symptoms' => $this->faker->optional()->sentence,
            'clinical_observations' => $this->faker->optional()->paragraph,
            'prescription' => $this->faker->optional()->paragraph,
            'recommendations' => $this->faker->optional()->paragraph,
            'next_visit_date' => $this->faker->optional()->dateTimeBetween('now', '+3 months'),
            'pdf_path' => null, // you can generate PDFs later if needed
        ];
    }
}