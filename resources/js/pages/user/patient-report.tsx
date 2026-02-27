/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
"use client";

import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Report {
  id: number;
  gestational_age_weeks: number;
  last_menstrual_period?: string;
  expected_delivery_date?: string;
  weight: number;
  blood_pressure: string;
  fetal_heart_rate: number;
  uterine_height?: number;
  symptoms?: string;
  clinical_observations?: string;
  prescription?: string;
  recommendations?: string;
  next_visit_date?: string;
  created_at: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

export default function PatientReport({
  patient,
  report,
  reportNumber,
}: {
  patient: Patient;
  report: Report;
  reportNumber: number;
}) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: "Patients", href: "#" },
        {
          title: `${patient.first_name} ${patient.last_name}`,
          href: route("patients.show", { patient: patient.id }),
        },
        { title: `Rapport - ${reportNumber}`, href: "#" },
      ]}
    >
      <Head title={`Rapport-${reportNumber}`} />

      <div className="p-6">
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="flex flex-row">Rapport - {reportNumber}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            <Info label="Âge gestationnel" value={`${report.gestational_age_weeks} semaines`} />
            <Info label="Dernières règles" value={report.last_menstrual_period ?? "—"} />
            <Info label="Date prévue d'accouchement" value={report.expected_delivery_date ?? "—"} />
            <Info label="Poids" value={`${report.weight} kg`} />
            <Info label="Tension" value={report.blood_pressure} />
            <Info label="Rythme cardiaque fœtal" value={`${report.fetal_heart_rate} bpm`} />
            <Info label="Hauteur utérine" value={report.uterine_height ?? "—"} />
            <Info label="Symptômes" value={report.symptoms ?? "—"} />
            <Info label="Observations cliniques" value={report.clinical_observations ?? "—"} />
            <Info label="Prescription" value={report.prescription ?? "—"} />
            <Info label="Recommandations" value={report.recommendations ?? "—"} />
            <Info label="Prochaine visite" value={report.next_visit_date ?? "—"} />
            <Info
              label="Créé le"
              value={new Date(report.created_at).toLocaleDateString("fr-FR")}
            />

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}