<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $priorities = ['low', 'medium', 'high'];
        $statuses = ['pending', 'in_progress', 'done', 'cancelled'];

        // Generate a start date within the next month
        $start = $this->faker->dateTimeBetween('now', '+1 month');

        // Generate an end date between the start date and up to 5 days after
        $end = (clone $start)->modify('+' . rand(0, 5) . ' days');

        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'priority' => $this->faker->randomElement($priorities),
            'status' => $this->faker->randomElement($statuses),
            'start_date' => $start->format('Y-m-d'),
            'due_date' => $end->format('Y-m-d'),
            'user_id' => User::factory(),
        ];
    }
}
