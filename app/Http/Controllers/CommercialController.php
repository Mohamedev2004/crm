<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CommercialController extends Controller
{
    // List all commercials
    public function index()
    {
        $commercials = User::where('role', 'commercial')
                            ->withCount('clients') // optional: count assigned clients
                            ->orderBy('name')
                            ->get();

        return Inertia::render('admin/commercials', [
            'commercials' => $commercials
        ]);
    }

    // Store a new commercial
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required','email','max:255', Rule::unique('users','email')],
            'password' => 'required|string|min:8|confirmed', // password confirmation required
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'commercial',
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Commercial created successfully.');
    }

    // Update an existing commercial
    public function update(Request $request, $id)
    {
        $commercial = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required','email','max:255', Rule::unique('users','email')->ignore($commercial->id)],
            'password' => 'nullable|string|min:8|confirmed', // optional
        ]);

        $commercial->name = $request->name;
        $commercial->email = $request->email;

        if ($request->password) {
            $commercial->password = Hash::make($request->password);
        }

        $commercial->save();

        return redirect()->back()->with('success', 'Commercial updated successfully.');
    }

    // Delete a commercial
    public function destroy($id)
    {
        $commercial = User::findOrFail($id);
        $commercial->delete();

        return redirect()->back()->with('success', 'Commercial deleted successfully.');
    }
}
