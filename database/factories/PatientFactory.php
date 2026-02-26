<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    protected $model = \App\Models\Patient::class;

    public function definition(): array
    {
        return [
            // Basic Information
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'cin' => $this->faker->unique()->bothify('??######'), // random CIN
            'phone' => $this->faker->phoneNumber,
            'email' => $this->faker->optional()->safeEmail,
            'date_of_birth' => $this->faker->optional()->date(),
            'address' => $this->faker->optional()->address,

            // Medical Information
            'blood_group' => $this->faker->optional()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'allergies' => $this->faker->optional()->sentence,
            'chronic_diseases' => $this->faker->optional()->sentence,
            'is_pregnant' => $this->faker->boolean(20), // 20% chance
            'notes' => $this->faker->optional()->paragraph,
        ];
    }
}