<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Transaction;
use App\Models\User;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['income', 'expense']);

        // Pick a random admin user (assuming 'role' column exists and 'admin' is the role)
        $adminUser = User::where('role', 'admin')->inRandomOrder()->first();

        return [
            'user_id' => $adminUser ? $adminUser->id : User::factory(), // fallback to factory if no admin exists
            'type' => $type,
            'title' => $this->faker->sentence(3),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'income_source' => $type === 'income'
                ? $this->faker->randomElement(['rental', 'investments', 'business', 'freelance'])
                : null,
            'expense_category' => $type === 'expense'
                ? $this->faker->randomElement(['food_drink', 'grocery', 'shopping', 'transport'])
                : null,
            'created_at' => $this->faker->dateTimeThisYear(),
            'updated_at' => now(),
        ];
    }
}
