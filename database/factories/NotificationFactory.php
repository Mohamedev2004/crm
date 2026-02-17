<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    public function definition(): array
    {
        $types = ['success', 'error', 'warning', 'info'];

        return [
            'title' => fake()->sentence(3, true),
            'message' => fake()->sentence(),
            'type' => fake()->randomElement($types),
            'is_read' => fake()->boolean(30),
        ];
    }
}

