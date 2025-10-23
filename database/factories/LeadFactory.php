<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lead>
 */
class LeadFactory extends Factory
{
    protected $model = \App\Models\Lead::class;

    public function definition(): array
    {
        // Choose a random client
        $client = User::where('role', 'client')->inRandomOrder()->first();
        // Choose a random commercial
        $commercial = User::where('role', 'commercial')->inRandomOrder()->first();

        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'service' => $this->faker->word(),
            'source' => $this->faker->randomElement(['social', 'email', 'call', 'others']),
            'status' => $this->faker->randomElement(['new', 'contacted', 'qualified', 'converted', 'lost']),
            'client_id' => $client?->id ?? User::factory()->create(['role' => 'client'])->id,
            'created_by' => $commercial?->id ?? User::factory()->create(['role' => 'commercial'])->id,
        ];
    }
}
