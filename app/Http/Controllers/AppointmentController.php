<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Appointment;

class AppointmentController extends Controller
{

    public function index()
    {
        // Use withTrashed() to get both active and soft-deleted appointments.
        $appointments = Appointment::all();

        return Inertia::render('admin/appointments', [
            'appointments' => $appointments,
        ]);
    }

    public function getAvailableAppointmentDates()
    {
        try {
            $appointments = Appointment::whereIn('status', ['Pending', 'Confirmed'])
                ->orderBy('appointment_date')
                ->get(['appointment_date']);

            $dates = [];

            foreach ($appointments as $appointment) {
                if (!$appointment->appointment_date) continue;

                $date = Carbon::parse($appointment->appointment_date);
                $year = $date->year;
                $month = $date->month;

                if (!isset($dates[$year])) {
                    $dates[$year] = [];
                }

                if (!in_array($month, $dates[$year])) {
                    $dates[$year][] = $month;
                }
            }

            return response()->json($dates);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getAppointmentCalendar(Request $request)
    {
        try {
            $month = $request->input('month');
            $year = $request->input('year');

            if (!$month || !$year) {
                return response()->json(['error' => 'Missing month or year'], 400);
            }

            $appointments = Appointment::whereYear('appointment_date', $year)
                ->whereMonth('appointment_date', $month)
                ->get();

            return response()->json($appointments);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_name'    => 'required|string|max:255',
            'appointment_phone'   => 'required|string|max:20',
            'appointment_email'   => 'required|email|max:255',
            'appointment_message' => 'required|string',
            'appointment_date'    => 'required|date',
        ]);

        $appointment = Appointment::create($validated);

        if ($appointment) {
            return back()->with('success', 'Appointment added successfully!');
        }

        return back()->with('error', 'Failed to add appointment.');
}


    public function setConfirmed($id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->update(['status' => 'Confirmed']);

        return back()->with('success', 'Appointment status set to Confirmed.');
    }

    public function setCompleted($id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->update(['status' => 'Completed']);

        return back()->with('success', 'Appointment status set to Completed.');
    }

    public function setCancelled($id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->update(['status' => 'Cancelled']);

        return back()->with('success', 'Appointment status set to Cancelled.');
    }

    public function confirmMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'Pending') // only confirm pending ones
            ->get();

        $updated = 0;

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'Confirmed']);
            $updated++;
        }

        return redirect()->back()->with('status', "{$updated} rendez-vous confirmés avec succès !");
    }


    public function cancelMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'Pending') // only confirm pending ones
            ->get();

        $updated = 0;

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'Cancelled']);
            $updated++;
        }

        return redirect()->back()->with('status', "{$updated} rendez-vous annulés avec succès !");
    }


    public function completeMany(Request $request)
    {
        $validated = $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'integer|exists:appointments,id',
        ]);

        $appointments = Appointment::whereIn('id', $validated['appointment_ids'])
            ->where('status', 'Confirmed') // only confirm pending ones
            ->get();

        $updated = 0;

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'Completed']);
            $updated++;
        }

        return redirect()->back()->with('status', "{$updated} rendez-vous complétés avec succès !");
    }

}
