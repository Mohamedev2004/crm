<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index()
    {
        $clients = User::where('role', 'client')
            ->with('commercial:id,name') // eager load commercial
            ->orderBy('name')
            ->get();

        $commercials = User::where('role', 'commercial')->get(['id', 'name']);

        return Inertia::render('admin/clients', [
            'clients' => $clients,
            'commercials' => $commercials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'commercial_id' => 'nullable|exists:users,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'client';

        User::create($validated);

        return redirect()->back()->with('success', 'Client created successfully.');
    }

    public function update(Request $request, User $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$client->id}",
            'phone' => 'nullable|string|max:20',
            'commercial_id' => 'nullable|exists:users,id',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $client->update($validated);

        return redirect()->back()->with('success', 'Client updated successfully.');
    }

    public function destroy(User $client)
    {
        $client->delete();

        return redirect()->back()->with('success', 'Client deleted successfully.');
    }
}
