<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Appointment;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'appointment_name' => $this->faker->name(),
            'appointment_phone' => $this->faker->numerify('06########'), // Moroccan style 10-digit
            'appointment_email' => $this->faker->safeEmail(),
            'appointment_message' => $this->faker->sentence(10),
            'status' => $this->faker->randomElement(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
            'appointment_date' => $this->faker->dateTimeBetween('now', '+1 year'),
        ];
    }
}
