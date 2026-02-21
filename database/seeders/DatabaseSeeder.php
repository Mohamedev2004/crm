<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Database\Seeders\NotificationSeeder;
use Database\Seeders\NewsletterSeeder;   

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create a user first
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Then seed notifications and newsletters
        $this->call([
            NotificationSeeder::class,
            NewsletterSeeder::class,
        ]);
    }
}
