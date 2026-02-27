<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        return [
            'full_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->optional()->safeEmail(),
            'appointment_date' => Carbon::now()->addDays(rand(1, 30)),
            'status' => $this->faker->randomElement($statuses),
            'note' => $this->faker->optional()->sentence(),
        ];
    }
}
