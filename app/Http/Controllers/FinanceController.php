<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $year = $request->input('year', $now->year); // ✅ Default: current year

        // --- Date setup for current and previous months ---
        $startOfPrevMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfPrevMonth = $now->copy()->subMonth()->endOfMonth();

        // --- Current month data ---
        $currentTransactions = $user->transactions()
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->get(['type', 'amount', 'income_source']);

        $currentInvoices = $user->invoices()
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->get(['status', 'total']);

        // --- Previous month data ---
        $prevTransactions = $user->transactions()
            ->whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])
            ->get(['type', 'amount', 'income_source']);

        $prevInvoices = $user->invoices()
            ->whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])
            ->get(['status', 'total']);

        // --- All-time transactions (for income by source) ---
        $allTransactions = $user->transactions()
            ->where('type', 'income')
            ->get(['income_source', 'amount']);

        // --- Helper: calculate totals ---
        $calculateTotals = fn($transactions, $invoices) => [
            'income' => $transactions->where('type', 'income')->sum('amount') +
                        $invoices->where('status', 'paid')->sum('total'),
            'expenses' => $transactions->where('type', 'expense')->sum('amount'),
            'balance' => ($transactions->where('type', 'income')->sum('amount') +
                          $invoices->where('status', 'paid')->sum('total')) -
                         $transactions->where('type', 'expense')->sum('amount'),
            'paidInvoices' => $invoices->where('status', 'paid')->count(),
        ];

        $currentTotals = $calculateTotals($currentTransactions, $currentInvoices);
        $prevTotals = $calculateTotals($prevTransactions, $prevInvoices);

        // --- Helper: calculate trends (percentage change) ---
        $calculateTrend = fn($current, $prev) => $prev > 0 ? round((($current - $prev) / $prev) * 100, 2) : null;

        $trends = [
            'balance' => $calculateTrend($currentTotals['balance'], $prevTotals['balance']),
            'income' => $calculateTrend($currentTotals['income'], $prevTotals['income']),
            'expenses' => $calculateTrend($currentTotals['expenses'], $prevTotals['expenses']),
            'paidInvoices' => $calculateTrend($currentTotals['paidInvoices'], $prevTotals['paidInvoices']),
        ];

        // --- Income by source ---
        $sources = ['rental', 'investments', 'business', 'freelance'];
        $incomeBySource = collect($sources)->map(function ($source) use ($allTransactions) {
            $sourceTotal = $allTransactions->where('income_source', $source)->sum('amount');
            $sourceDeals = $allTransactions->where('income_source', $source)->count();

            return [
                'stage' => $source,
                'deals' => $sourceDeals,
                'value' => $sourceTotal,
                'trend' => null,
            ];
        })->toArray();

        // --- Monthly expenses (✅ all years, not filtered by year) ---
        $monthlyExpenses = $user->transactions()
            ->select(
                DB::raw('DATE_FORMAT(MIN(created_at), "%b") as month'),
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(amount) as total'),
                DB::raw('YEAR(created_at) as year')
            )
            ->where('type', 'expense')
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'), 'asc')
            ->orderBy(DB::raw('MONTH(created_at)'), 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                    'year' => (int) $item->year,
                ];
            });

        // --- Available years (from both transactions + invoices) ---
        $transactionYears = $user->transactions()
            ->select(DB::raw('DISTINCT YEAR(created_at) as year'))
            ->pluck('year');

        $invoiceYears = $user->invoices()
            ->select(DB::raw('DISTINCT YEAR(created_at) as year'))
            ->pluck('year');

        $availableYears = $transactionYears
            ->merge($invoiceYears)
            ->unique()
            ->sortDesc()
            ->values();

        // --- Expenses by category (for the donut chart) ---
        $categories = ['food_drink', 'grocery', 'shopping', 'transport'];
        $expensesByCategory = collect($categories)->map(function ($category) use ($user, $year) {
            $total = $user->transactions()
                ->where('type', 'expense')
                ->where('expense_category', $category)
                ->whereYear('created_at', $year)
                ->sum('amount');

            $count = $user->transactions()
                ->where('type', 'expense')
                ->where('expense_category', $category)
                ->whereYear('created_at', $year)
                ->count();

            return [
                'category' => $category,
                'total' => (float) $total,
                'count' => $count, // ✅ added
            ];
        })->filter(fn($item) => $item['total'] > 0)->values();

        // --- Render ---
        return Inertia::render('admin/finance', [
            'totals' => $currentTotals,
            'trends' => $trends,
            'incomeBySource' => $incomeBySource,
            'monthlyExpenses' => $monthlyExpenses,
            'availableYears' => $availableYears,
            'selectedYear' => $year,
            'expensesByCategory' => $expensesByCategory,
        ]);
    }
}
