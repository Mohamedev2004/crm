<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'phone' => fake()->phoneNumber(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'client', // default role
            'commercial_id' => null, // only for clients
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Set role states
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'commercial_id' => null,
        ]);
    }

    public function commercial(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'commercial',
            'commercial_id' => null,
        ]);
    }

    public function client(?int $commercialId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'client',
            'commercial_id' => $commercialId,
        ]);
    }
}
