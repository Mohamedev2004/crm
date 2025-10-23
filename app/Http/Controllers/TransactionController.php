<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index()
    {
        $transactions = Transaction::where('user_id', Auth::id())
            ->get();

        return Inertia::render('admin/transactions', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'income_source' => 'nullable|required_if:type,income|in:rental,investments,business,freelance',
            'expense_category' => 'nullable|required_if:type,expense|in:food_drink,grocery,shopping,transport',
        ]);

        $validated['user_id'] = Auth::id();

        Transaction::create($validated);

        return redirect()->back()->with('success', 'Transaction added successfully.');
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'income_source' => 'nullable|required_if:type,income|in:rental,investments,business,freelance',
            'expense_category' => 'nullable|required_if:type,expense|in:food_drink,grocery,shopping,transport',
        ]);

        $transaction->update($validated);

        return redirect()->back()->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Transaction $transaction)
    {

        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}
