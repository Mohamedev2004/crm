<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Revenue;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();

        // --- Global totals (all-time) ---
        $totals = [
            'revenues' => Revenue::sum('amount'),
            'clients'  => User::where('role', 'client')->count(),
            'leads'    => Lead::count(),
            'deals'    => Deal::count(),
        ];

        // --- Current month stats ---
        $current = [
            'revenues' => Revenue::whereMonth('created_at', $now->month)->sum('amount'),
            'clients'  => User::where('role', 'client')->whereMonth('created_at', $now->month)->count(),
            'leads'    => Lead::whereMonth('created_at', $now->month)->count(),
            'deals'    => Deal::whereMonth('created_at', $now->month)->count(),
        ];

        // --- Last month stats ---
        $previous = [
            'revenues' => Revenue::whereMonth('created_at', $lastMonth->month)->sum('amount'),
            'clients'  => User::where('role', 'client')->whereMonth('created_at', $lastMonth->month)->count(),
            'leads'    => Lead::whereMonth('created_at', $lastMonth->month)->count(),
            'deals'    => Deal::whereMonth('created_at', $lastMonth->month)->count(),
        ];

        // --- Compute percentage changes ---
        $changes = [];
        foreach ($current as $key => $value) {
            $prev = $previous[$key] ?: 1; // avoid division by zero
            $changes[$key] = round((($value - $prev) / $prev) * 100, 1);
        }

        // --- Leads by Source ---
        $leadsBySource = Lead::selectRaw('source, COUNT(*) as total')
            ->groupBy('source')
            ->pluck('total', 'source');


        // --- 3 Tasks with closest due dates (belonging to current user) ---
        $upcomingTasks = Task::where('user_id', Auth::id())
            ->whereDate('due_date', '>=', now()) // only future or current
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get(['id', 'title', 'due_date', 'priority', 'status']);

        
        // --- Sales Pipeline Data (Minimal) ---
        $stages = ['lead', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

        // ✅ Query deals grouped by stage
        $salesPipeline = Deal::selectRaw('stage, COUNT(*) as deals, SUM(value) as value')
            ->whereIn('stage', $stages)
            ->groupBy('stage')
            ->get()
            ->map(function ($item) {
                return [
                    'stage' => $item->stage,
                    'deals' => (int) $item->deals,
                    'value' => (float) $item->value,
                ];
            })
            ->keyBy('stage');

        // ✅ Ensure all stages exist (even with 0 deals)
        $salesPipeline = collect($stages)->map(function ($stage) use ($salesPipeline) {
            return [
                'stage' => $stage,
                'deals' => $salesPipeline[$stage]['deals'] ?? 0,
                'value' => $salesPipeline[$stage]['value'] ?? 0.0,
            ];
        })->values();


        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totals'  => $totals,
                'changes' => $changes,
            ],
            'charts' => [
                'leadsBySource' => $leadsBySource,
            ],
            'tasks' => $upcomingTasks,
            'salesPipeline' => $salesPipeline,
        ]);
    }
}
