<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function store(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'gestational_age_weeks' => 'required|integer|min:0',
            'weight' => 'required|numeric|min:0',
            'blood_pressure' => 'required|string|max:255',
            'fetal_heart_rate' => 'required|integer|min:0',
            'last_menstrual_period' => 'nullable|date',
            'expected_delivery_date' => 'nullable|date',
            'uterine_height' => 'nullable|integer|min:0',
            'symptoms' => 'nullable|string',
            'clinical_observations' => 'nullable|string',
            'prescription' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $report = $patient->reports()->create($validated);

        return redirect()->back()->with('success', 'Rapport créé avec succès.');
    }
}
