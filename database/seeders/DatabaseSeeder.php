<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use App\Models\User;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Revenue;
use App\Models\Task;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();

        // --- Create Users ---
        $admins = User::factory()->count(1)->create(['role' => 'admin']);
        $commercials = User::factory()->count(5)->commercial()->create();

        // --- Clients (split last month / this month) ---
        $totalClients = 20;
        $half = $totalClients / 2;

        $clientsLastMonth = User::factory()
            ->count($half)
            ->client()
            ->create(['created_at' => $lastMonth->copy()->subDays(rand(0, 25))])
            ->each(fn($client) => $client->update([
                'commercial_id' => $commercials->random()->id,
            ]));

        $clientsCurrentMonth = User::factory()
            ->count($half)
            ->client()
            ->create(['created_at' => $now->copy()->subDays(rand(0, 25))])
            ->each(fn($client) => $client->update([
                'commercial_id' => $commercials->random()->id,
            ]));

        $clients = $clientsLastMonth->merge($clientsCurrentMonth);

        // --- Leads ---
        $currentLeads = Lead::factory()->count(30)->create([
            'created_at' => $now->copy()->subDays(rand(0, 25)),
        ]);
        $pastLeads = Lead::factory()->count(20)->create([
            'created_at' => $lastMonth->copy()->subDays(rand(0, 25)),
        ]);

        // --- Deals from converted leads ---
        foreach ($currentLeads->filter(fn($l) => $l->status === 'converted') as $lead) {
            Deal::factory()->create([
                'lead_id' => $lead->id,
                'client_id' => $lead->client_id,
                'created_by' => $lead->created_by,
                'created_at' => $now->copy()->subDays(rand(0, 25)),
            ]);
        }

        foreach ($pastLeads->filter(fn($l) => $l->status === 'converted') as $lead) {
            Deal::factory()->create([
                'lead_id' => $lead->id,
                'client_id' => $lead->client_id,
                'created_by' => $lead->created_by,
                'created_at' => $lastMonth->copy()->subDays(rand(0, 25)),
            ]);
        }

        // --- Revenues ---
        Revenue::factory()->count(10)->create([
            'amount' => 1000,
            'created_at' => $lastMonth->copy()->subDays(rand(0, 25)),
        ]);

        Revenue::factory()->count(15)->create([
            'amount' => 2500,
            'created_at' => $now->copy()->subDays(rand(0, 25)),
        ]);

        // --- Tasks for admins and commercials ---
        $allUsers = $admins->merge($commercials);

        foreach ($allUsers as $user) {
            // Each user gets 5–10 tasks
            Task::factory()->count(rand(5, 10))->create([
                'user_id' => $user->id,
                'created_at' => $now->copy()->subDays(rand(0, 25)),
                'due_date' => $now->copy()->addDays(rand(0, 30))->format('Y-m-d'),
            ]);
        }
        $this->call([
            AppointmentSeeder::class,
            InvoiceSeeder::class,
            TransactionSeeder::class,
        ]);

        $this->command->info('✅ Database seeded with clients, leads, deals, revenues, tasks, and appointments!');
    }

}
