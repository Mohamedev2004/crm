<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::where('user_id', Auth::id())->get();

        return Inertia::render('admin/invoices', [
            'invoices' => $invoices,
        ]);
    }

    public function download(Invoice $invoice)
    {
        if ($invoice->file_path && Storage::disk('public')->exists($invoice->file_path)) {
            return response()->download(
                Storage::disk('public')->path($invoice->file_path),
                $invoice->title . '.pdf'
            );
        }

        abort(404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'status' => 'in:pending,overdue,paid',
            'due_date' => 'nullable|date',
            'currency' => 'required|string|max:10',
            'client_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['invoice_number'] = strtoupper(Str::random(10));
        $validated['total'] = (float) ($validated['amount'] + ($validated['tax'] ?? 0) - ($validated['discount'] ?? 0));

        $invoice = Invoice::create($validated);

        // Generate PDF
        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => $invoice]);

        $fileName = (string) Str::uuid() . '.pdf';
        $path = 'invoices/' . $fileName;

        Storage::disk('public')->put($path, $pdf->output());

        $invoice->update(['file_path' => $path]);

        return back()->with('success', 'Invoice created successfully!');
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'status' => 'in:pending,overdue,paid',
            'due_date' => 'nullable|date',
            'currency' => 'required|string|max:10',
            'client_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
        ]);

        $validated['total'] = (float) ($validated['amount'] + ($validated['tax'] ?? 0) - ($validated['discount'] ?? 0));

        $invoice->update($validated);

        // Regenerate PDF
        if ($invoice->file_path && Storage::disk('public')->exists($invoice->file_path)) {
            Storage::disk('public')->delete($invoice->file_path);
        }

        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => $invoice]);
        $fileName = (string) Str::uuid() . '.pdf';
        $path = 'invoices/' . $fileName;

        Storage::disk('public')->put($path, $pdf->output());
        $invoice->update(['file_path' => $path]);

        return back()->with('success', 'Invoice updated successfully!');
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->file_path && Storage::disk('public')->exists($invoice->file_path)) {
            Storage::disk('public')->delete($invoice->file_path);
        }

        $invoice->delete();

        return back()->with('success', 'Invoice deleted successfully!');
    }

    // ✅ Mark invoice as paid
    public function setPaid(Invoice $invoice)
    {
        $invoice->update(['status' => 'paid']);
        return back()->with('success', 'Invoice marked as paid!');
    }

    // ✅ Mark invoice as overdue
    public function setOverdue(Invoice $invoice)
    {
        $invoice->update(['status' => 'overdue']);
        return back()->with('success', 'Invoice marked as overdue!');
    }
}
