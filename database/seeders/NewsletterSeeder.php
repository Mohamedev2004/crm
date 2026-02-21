<?php

namespace Database\Seeders;

use App\Models\Newsletter;
use Illuminate\Database\Seeder;
use App\Models\User;

class NewsletterSeeder extends Seeder
{
    public function run(): void
    {
        Newsletter::factory()
            ->count(15)
            ->create();
    }
}
