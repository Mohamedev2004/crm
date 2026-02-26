<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'done', 'overdue'];

        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'due_date' => $this->faker->dateTimeBetween('-1 week', '+1 month'),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => $this->faker->randomElement($statuses),

            // 70% chance to attach to a patient
            'patient_id' => Patient::inRandomOrder()->value('id'),
        ];
    }
}