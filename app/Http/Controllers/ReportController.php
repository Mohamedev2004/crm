<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class ReportController extends Controller
{
    public function create(Patient $patient)
    {
        return Inertia::render('user/patient-report-create', [
            'patient' => $patient,
        ]);
    }

    public function store(Request $request, Patient $patient)
    {
        // 1️⃣ Validate input
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

        // 2️⃣ Create the report
        $report = $patient->reports()->create($validated);

        // 3️⃣ Generate the PDF using Spatie
        $pdfFileName = 'report_'.$report->id.'_'.time().'.pdf';
        $pdfRelativePath = 'reports/'.$pdfFileName; // Relative to storage/app/public

        // Make sure the "reports" folder exists in public disk
        Storage::disk('public')->makeDirectory('reports');

        // Generate the PDF and save to storage/app/public/reports
        Pdf::view('reports.pdf', [
            'patient' => $patient,
            'report' => $report,
        ])
            ->save(Storage::disk('public')->path($pdfRelativePath));

        // 4️⃣ Update the report with pdf_path
        $report->update(['pdf_path' => $pdfRelativePath]);

        // 5️⃣ Redirect back
        return redirect()
            ->route('patients.show', $patient->id)
            ->with('success', 'Rapport créé avec succès et PDF généré.');
    }

    public function show(Patient $patient, Report $report)
    {
        // Security: ensure report belongs to patient
        if ($report->patient_id !== $patient->id) {
            abort(404);
        }

        // Calculate the report sequence number for this patient
        $reportNumber = $patient->reports()
            ->where('created_at', '<=', $report->created_at)
            ->where('id', '<=', $report->id)
            ->count();

        return inertia('user/patient-report', [
            'patient' => $patient,
            'report' => $report,
            'reportNumber' => $reportNumber,
        ]);
    }

    public function downloadPdf(Patient $patient, Report $report)
    {
        // Security: ensure report belongs to patient
        if ($report->patient_id !== $patient->id) {
            abort(404);
        }

        // Check if PDF exists in public disk
        if (! $report->pdf_path || ! Storage::disk('public')->exists($report->pdf_path)) {
            abort(404, 'PDF non trouvé.');
        }

        return Storage::disk('public')->download($report->pdf_path);
    }
}
