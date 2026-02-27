<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $sortable = [
            'id',
            'full_name',
            'phone',
            'email',
            'appointment_date',
            'status',
            'created_at',
        ];

        $search = $request->input('search');
        $trashed = $request->input('trashed', 'all');
        $sortBy = in_array($request->input('sortBy'), $sortable)
                    ? $request->input('sortBy')
                    : 'appointment_date';

        $sortDir = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';

        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30, 50])
                    ? (int) $request->input('perPage')
                    : 10;

        $query = Appointment::query();

        // Gestion Soft Deletes
        switch ($trashed) {
            case 'all':
                $query->withTrashed();
                break;
            case 'actifs':
                $query->whereNull('deleted_at');
                break;
            case 'deleted':
                $query->onlyTrashed();
                break;
        }

        // Recherche
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%");
            });
        }

        $query->orderBy($sortBy, $sortDir);

        $appointments = $query
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('user/appointments', [
            'appointments' => $appointments,
            'filters' => [
                'search' => $search,
                'trashed' => $trashed,
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'appointment_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        try {
            $appointment = Appointment::create($validated);

            if ($appointment) {
                Notification::create([
                    'title' => 'Nouveau rendez-vous',
                    'message' => "Vous avez reçu un nouveau rendez-vous de {$appointment->full_name}",
                    'type' => 'information',
                ]);

                return back()->with('success', 'Rendez-vous ajouté avec succès !');
            }

            return back()->with('error', 'Échec de l’ajout du rendez-vous.');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l’ajout du rendez-vous : '.$e->getMessage());

            return back()->with('error', 'Une erreur est survenue, veuillez réessayer.');
        }
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'appointment_date' => 'required|date',
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled',
            'note' => 'nullable|string',
        ]);

        $appointment->update($validated);

        return back()->with('success', 'Rendez-vous mis à jour avec succès.');
    }

    public function setConfirmed($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => 'confirmed']);

        return back()->with('success', 'Le rendez-vous a été confirmé avec succès.');
    }

    public function setCompleted($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => 'completed']);

        return back()->with('success', 'Le rendez-vous a été marqué comme complété avec succès.');
    }

    public function setCancelled($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Le rendez-vous a été annulé avec succès.');
    }

    public function confirmMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'pending')
            ->get();

        $updated = 0;
        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'confirmed']);
            $updated++;
        }

        return back()->with('status', "{$updated} rendez-vous confirmés avec succès !");
    }

    public function cancelMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'pending')
            ->get();

        $updated = 0;
        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'cancelled']);
            $updated++;
        }

        return back()->with('status', "{$updated} rendez-vous annulés avec succès !");
    }

    public function completeMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'confirmed')
            ->get();

        $updated = 0;
        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'completed']);
            $updated++;
        }

        return back()->with('status', "{$updated} rendez-vous complétés avec succès !");
    }
}
