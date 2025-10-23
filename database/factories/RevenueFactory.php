<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Revenue;
use App\Models\Deal;

class RevenueFactory extends Factory
{
    protected $model = Revenue::class;

    public function definition(): array
    {
        return [
            'deal_id' => Deal::inRandomOrder()->first()?->id ?? Deal::factory(),
            'amount' => $this->faker->randomFloat(2, 500, 10000),
            'payment_date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
