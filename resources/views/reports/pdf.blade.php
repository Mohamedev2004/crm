<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Patient</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 14px; }
        h1 { text-align: center; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <h1>Rapport Patient</h1>

    <div class="section">
        <p><span class="label">Nom:</span> {{ $patient->first_name }} {{ $patient->last_name }}</p>
        <p><span class="label">Téléphone:</span> {{ $patient->phone }}</p>
        <p><span class="label">Email:</span> {{ $patient->email ?? '—' }}</p>
        <p><span class="label">Adresse:</span> {{ $patient->address ?? '—' }}</p>
        <p><span class="label">Date de naissance:</span> {{ $patient->date_of_birth }}</p>
    </div>

    <div class="section">
        <h2>Informations médicales</h2>
        <p><span class="label">Âge gestationnel:</span> {{ $report->gestational_age_weeks }} semaines</p>
        <p><span class="label">Dernières règles:</span> {{ $report->last_menstrual_period ?? '—' }}</p>
        <p><span class="label">Date prévue d'accouchement:</span> {{ $report->expected_delivery_date ?? '—' }}</p>
        <p><span class="label">Poids:</span> {{ $report->weight }} kg</p>
        <p><span class="label">Tension:</span> {{ $report->blood_pressure }}</p>
        <p><span class="label">Rythme cardiaque fœtal:</span> {{ $report->fetal_heart_rate }}</p>
        <p><span class="label">Hauteur utérine:</span> {{ $report->uterine_height ?? '—' }} cm</p>
    </div>

    <div class="section">
        <h2>Observations & Prescription</h2>
        <p><span class="label">Symptômes:</span> {{ $report->symptoms ?? '—' }}</p>
        <p><span class="label">Observations cliniques:</span> {{ $report->clinical_observations ?? '—' }}</p>
        <p><span class="label">Prescription:</span> {{ $report->prescription ?? '—' }}</p>
        <p><span class="label">Recommandations:</span> {{ $report->recommendations ?? '—' }}</p>
        <p><span class="label">Prochaine visite:</span> {{ $report->next_visit_date ?? '—' }}</p>
    </div>
</body>
</html>