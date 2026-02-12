<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'make:admin 
                            {name? : Name of the admin} 
                            {email? : Email of the admin} 
                            {password? : Password of the admin}';

    protected $description = 'Create an admin account';

    public function handle()
    {
        // ⛔ Block if an admin already exists
        if (User::where('role', 'admin')->exists()) {
            $this->error('An admin account already exists. Only one admin is allowed.');
            return 1;
        }

        $name = $this->argument('name') ?? $this->ask('Admin Name');
        $email = $this->argument('email') ?? $this->ask('Admin Email');
        $password = $this->argument('password') ?? $this->secret('Admin Password');

        if (User::where('email', $email)->exists()) {
            $this->error("A user with email {$email} already exists.");
            return 1;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'role' => 'admin',
        ]);

        $this->info('Admin user created successfully!');
    }
}