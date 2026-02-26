<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Liste des patients avec filtres, recherche, tri et pagination
     */
    public function index(Request $request)
    {
        $sortable = [
            'id',
            'first_name',
            'last_name',
            'cin',
            'group_blood',
            'phone',
            'created_at',
        ];

        $search = $request->input('search');
        $trashed = $request->input('trashed', 'all');
        $sortBy = in_array($request->input('sortBy'), $sortable)
                        ? $request->input('sortBy')
                        : 'created_at';

        $sortDir = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';

        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30, 50])
                        ? (int) $request->input('perPage')
                        : 10;

        $query = Patient::query();

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
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('cin', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $query->orderBy($sortBy, $sortDir);

        $patients = $query
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('user/patients', [
            'patients' => $patients,
            'filters' => [
                'search' => $search,
                'trashed' => $trashed,
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store basic infos (Step 1)
     */
    public function storeBasicInfos(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'cin' => 'nullable|string|max:50|unique:patients,cin',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
        ]);

        try {
            $patient = Patient::create($validated);

            // Return patient JSON directly
            return response()->json([
                'success' => true,
                'patient' => $patient,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur création patient (basic infos): '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du patient.',
            ], 500);
        }
    }

    /**
     * Store medical infos (Step 2)
     */
    public function storeMedicalInfos(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|string',
            'chronic_diseases' => 'nullable|string',
            'is_pregnant' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        try {
            $patient->update($validated);

            return response()->json([
                'success' => true,
                'patient' => $patient,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur création patient (medical infos): '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des informations médicales.',
            ], 500);
        }
    }

    /**
     * Update patient
     */
    public function updateBasicInfos(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'cin' => 'nullable|string|max:50|unique:patients,cin,'.$id,
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
        ]);

        $patient->update($validated);

        return back()->with('success', 'Infos de base mises à jour avec succès.');
    }

    public function updateMedicalInfos(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|string',
            'chronic_diseases' => 'nullable|string',
            'is_pregnant' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $patient->update($validated);

        return back()->with('success', 'Infos médicales mises à jour avec succès.');
    }

    public function show(Request $request, Patient $patient)
    {
        $sortable = [
            'id',
            'gestational_age_weeks',
            'created_at',
        ];

        $search = $request->input('search');
        $sortBy = in_array($request->input('sortBy'), $sortable)
                        ? $request->input('sortBy')
                        : 'created_at';

        $sortDir = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';

        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30])
                        ? (int) $request->input('perPage')
                        : 5;

        $query = $patient->reports();

        if (! empty($search)) {
            if (is_numeric($search)) {
                // Find the ID of the report that has this sequence number
                // Sequence is determined by created_at ASC, then id ASC
                $targetReportId = $patient->reports()
                    ->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc')
                    ->offset((int) $search - 1)
                    ->limit(1)
                    ->value('id');

                if ($targetReportId) {
                    $query->where('id', $targetReportId);
                } else {
                    $query->whereRaw('1 = 0'); // Force no results if number doesn't exist
                }
            } else {
                // If search is not numeric, fallback to ID search (though user requested number)
                $query->where('id', 'like', "%{$search}%");
            }
        }

        $query->orderBy($sortBy, $sortDir);

        $reports = $query
            ->paginate($perPage)
            ->appends($request->query());

        // Add sequence number to each report
        $reports->getCollection()->transform(function ($report, $key) use ($patient) {
            $report->number = $patient->reports()
                ->where('created_at', '<=', $report->created_at)
                ->where('id', '<=', $report->id)
                ->count();

            return $report;
        });

        return inertia('user/patient-details', [
            'patient' => $patient,
            'reports' => $reports,
            'filters' => [
                'search' => $search,
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Delete patient (soft delete)
     */
    public function destroy($id)
    {
        $patient = Patient::with('reports')->findOrFail($id);

        // Soft-delete all related reports
        foreach ($patient->reports as $report) {
            $report->delete();
        }

        // Soft-delete the patient
        $patient->delete();

        return back()->with('success', 'Patient et ses rapports supprimés avec succès.');
    }

    /**
     * Bulk delete
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:patients,id',
        ]);

        // Get patients including reports
        $patients = Patient::with('reports')->whereIn('id', $request->ids)->get();

        foreach ($patients as $patient) {
            // Delete all related reports
            foreach ($patient->reports as $report) {
                $report->delete();
            }

            // Delete the patient
            $patient->delete();
        }

        return back()->with('success', 'Patients et leurs rapports supprimés avec succès.');
    }

    /**
     * Restore one
     */
    public function restore($id)
    {
        $patient = Patient::withTrashed()->findOrFail($id);

        if ($patient->trashed()) {
            // Restore patient
            $patient->restore();

            // Restore all soft-deleted reports
            $patient->reports()->onlyTrashed()->restore();

            return back()->with('success', 'Patient et ses rapports restaurés avec succès.');
        }

        return back()->with('error', 'Ce patient n\'est pas supprimé.');
    }

    /**
     * Restore all
     */
    public function restoreAll()
    {
        $patients = Patient::onlyTrashed()->get();

        foreach ($patients as $patient) {
            $patient->restore();
            $patient->reports()->onlyTrashed()->restore();
        }

        return back()->with('success', 'Tous les patients et leurs rapports supprimés ont été restaurés avec succès.');
    }
}
