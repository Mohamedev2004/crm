<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\Deal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index()
    {
        $leads = Lead::with(['client', 'createdBy'])->get();

        $clients = User::where('role', 'client')->get(['id', 'name']);
        $statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];

        $leads = $leads->map(function ($lead) {
            return [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'service' => $lead->service,
                'source' => $lead->source ?? 'social', // changed
                'content' => $lead->content,
                'status' => $lead->status,
                'client' => $lead->client,
                'created_by' => $lead->createdBy,
                'created_at' => $lead->created_at,
            ];
        });

        $creators = User::where('role', 'commercial')->get(['id', 'name']);

        return Inertia::render('admin/leads', [
            'leads' => $leads,
            'clients' => $clients,
            'statuses' => $statuses,
            'creators' => $creators,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'service' => 'required|string|max:255',
            'source' => 'required|in:social,call,email,others', // changed
            'content' => 'nullable|string',
            'status' => 'required|in:new,contacted,qualified,converted,lost',
            'client_id' => 'required|exists:users,id',
        ]);

        $validated['created_by'] = Auth::id();

        Lead::create($validated);

        return redirect()->back()->with('success', 'Lead created successfully.');
    }

    // Update lead details without changing status
    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'service' => 'required|string|max:255',
            'source' => 'required|in:social,call,email,others', // changed
            'content' => 'nullable|string',
            'client_id' => 'required|exists:users,id',
        ]);

        $lead->update($validated);

        return redirect()->back()->with('success', 'Lead updated successfully.');
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->back()->with('success', 'Lead deleted successfully.');
    }

    // ===== Status update methods =====
    public function setNew(Lead $lead)
    {
        $lead->update(['status' => 'new']);
        return redirect()->back()->with('success', 'Lead status set to New.');
    }

    public function setContacted(Lead $lead)
    {
        $lead->update(['status' => 'contacted']);
        return redirect()->back()->with('success', 'Lead status set to Contacted.');
    }

    public function setQualified(Request $request, Lead $lead) // Use $lead from Route Model Binding
    {
        // The lead is already retrieved via Route Model Binding
        
        // 1. Validate only the necessary fields from the request body
        $validated = $request->validate([
            'value' => 'required|numeric|min:0', // Only need to validate 'value'
        ]);
        
        // Ensure the lead has a client before creating a deal
        if (!$lead->client_id) {
            return back()->with('error', 'Cannot create deal: lead has no client assigned.');
        }

        // 2. Set the Lead status to 'qualified'
        // You can remove this line as you're immediately converting it to 'converted' later, 
        // or keep it if you need a specific qualified state before creating the deal.
        // $lead->update(['status' => 'qualified']); 

        // 3. Create the deal
        Deal::create([
            'title'     => "Deal for {$lead->name}",
            'lead_id'   => $lead->id,
            'client_id' => $lead->client_id,
            'value'     => $validated['value'], // Use the validated value
            'created_by'=> Auth::id(),
        ]);

        // 4. Update lead to converted
        $lead->update(['status' => 'converted']);

        return back()->with('success', 'Lead qualified and deal created successfully!');
    }

    public function setConverted(Lead $lead)
    {
        $lead->update(['status' => 'converted']);
        return redirect()->back()->with('success', 'Lead status set to Converted.');
    }

    public function setLost(Lead $lead)
    {
        $lead->update(['status' => 'lost']);
        return redirect()->back()->with('success', 'Lead status set to Lost.');
    }
}
