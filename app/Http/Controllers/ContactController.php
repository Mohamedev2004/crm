<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $sortable = [
            'id',
            'name',
            'phone',
            'email',
            'subject',
            'message',
            'created_at',
        ];

        $search = $request->input('search');
        $status = $request->input('status'); // New status filter
        $sortBy = in_array($request->input('sortBy'), $sortable)
                    ? $request->input('sortBy')
                    : 'created_at';

        $sortDir = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';

        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30, 50])
                    ? (int) $request->input('perPage')
                    : 10;

        $query = Contact::query();

        // Recherche
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if (! empty($status)) {
            $query->where('status', $status);
        }

        $query->orderBy($sortBy, $sortDir);

        $contacts = $query
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('user/contacts', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            $contact = Contact::create($validated);

            if ($contact) {
                Notification::create([
                    'title' => 'Nouveau message',
                    'message' => "Vous avez reçu un nouveau message de {$contact->name}",
                    'type' => 'information',
                ]);

                return back()->with('success', 'Message ajouté avec succès !');
            }

            return back()->with('error', 'Échec de l’ajout du message.');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l’ajout du message : '.$e->getMessage());

            return back()->with('error', 'Une erreur est survenue, veuillez réessayer.');
        }
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string',
        ]);

        $contact->update($validated);

        return back()->with('success', 'Message mis à jour avec succès.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return back()->with('success', 'Message supprimé avec succès.');
    }
}
