<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUser extends Command
{
    protected $signature = 'make:user 
                            {name? : Name of the user} 
                            {email? : Email of the user} 
                            {password? : Password of the user}';

    protected $description = 'Create a user account';

    public function handle()
    {
        $name = $this->argument('name') ?? $this->ask('User Name');
        $email = $this->argument('email') ?? $this->ask('User Email');
        $password = $this->argument('password') ?? $this->secret('User Password');

        if (User::where('email', $email)->exists()) {
            $this->error("A user with email {$email} already exists.");
            return 1;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        $this->info('User created successfully!');
    }
}