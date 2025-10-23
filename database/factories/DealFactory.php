<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Lead;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deal>
 */
class DealFactory extends Factory
{
    protected $model = \App\Models\Deal::class;

    public function definition(): array
    {
        $lead = Lead::inRandomOrder()->first();
        $client = $lead?->client ?? User::where('role', 'client')->inRandomOrder()->first();
        $creator = User::where('role', 'commercial')->inRandomOrder()->first();

        return [
            'title' => $this->faker->catchPhrase(),
            'value' => $this->faker->randomFloat(2, 1000, 100000),
            'stage' => $this->faker->randomElement(['lead', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
            'notes' => $this->faker->optional()->paragraph(),
            'lead_id' => $lead?->id,
            'client_id' => $client?->id,
            'created_by' => $creator?->id ?? User::factory()->create(['role' => 'commercial'])->id,
        ];
    }
}
