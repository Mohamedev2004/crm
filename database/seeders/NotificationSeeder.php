<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if ($admin) {
            Notification::factory()
                ->count(15)
                ->create([
                    'user_id' => $admin->id,
                ]);
        }
    }
}

