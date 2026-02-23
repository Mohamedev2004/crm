/* eslint-disable import/order */
"use client";

import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: number;
  gestational_age_weeks?: number;
  expected_delivery_date?: string;
  weight?: number;
  blood_pressure?: string;
  fetal_heart_rate?: number;
  created_at: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  blood_group?: string;
  allergies?: string;
  chronic_diseases?: string;
  is_pregnant: boolean;
  notes?: string;
  reports: Report[];
}

export default function PatientDetails({ patient }: { patient: Patient }) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: "Crm Tools", href: "/patients" },
        { title: "Patients", href: "/patients" },
        { title: patient.first_name + " " + patient.last_name, href: "#" },
      ]}
    >
      <Head title="Détails Patient" />

      <div className="space-y-6 px-6 py-4">

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>
              {patient.first_name} {patient.last_name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <p><strong>Téléphone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email ?? "—"}</p>
            <p><strong>Groupe sanguin:</strong> {patient.blood_group ?? "—"}</p>
            <p><strong>Allergies:</strong> {patient.allergies ?? "—"}</p>
            <p><strong>Maladies chroniques:</strong> {patient.chronic_diseases ?? "—"}</p>
            <p>
              <strong>Grossesse:</strong>{" "}
              <Badge variant={patient.is_pregnant ? "default" : "outline"}>
                {patient.is_pregnant ? "Oui" : "Non"}
              </Badge>
            </p>
            <p><strong>Notes:</strong> {patient.notes ?? "—"}</p>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports Sage Femme</CardTitle>
          </CardHeader>

          <CardContent>
            {patient.reports.length === 0 && (
              <p className="text-muted-foreground">
                Aucun rapport disponible.
              </p>
            )}

            <div className="space-y-4">
              {patient.reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <p><strong>Âge gestationnel:</strong> {report.gestational_age_weeks ?? "—"} semaines</p>
                  <p><strong>Poids:</strong> {report.weight ?? "—"} kg</p>
                  <p><strong>Tension:</strong> {report.blood_pressure ?? "—"}</p>
                  <p><strong>Rythme cardiaque fœtal:</strong> {report.fetal_heart_rate ?? "—"} bpm</p>
                  <p><strong>Créé le:</strong> {new Date(report.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}