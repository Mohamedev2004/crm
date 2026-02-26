/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
"use client";

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";import { Badge } from "@/components/ui/badge";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogHeader,
  NativeDialogTitle,
  NativeDialogFooter,
} from "@/components/native-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, SquarePen } from "lucide-react";
import { UpdatePatientBasicModal } from "@/components/user/patients/update-patient-basic-infos-modal";
import { UpdatePatientMedicalModal } from "@/components/user/patients/update-patient-medical-infos-modal";

interface Report {
  id: number;
  gestational_age_weeks?: number;
  last_menstrual_period?: string;
  expected_delivery_date?: string;
  weight?: number;
  blood_pressure?: string;
  fetal_heart_rate?: number;
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
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  cin?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  chronic_diseases?: string | null;
  notes?: string | null;
  is_pregnant?: boolean;
  created_at: string;
  deleted_at?: string | null;
  reports: Report[];
}

export default function PatientDetails({ patient }: { patient: Patient }) {
  const reports = patient.reports ?? [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditBasicOpen, setIsEditBasicOpen] = useState(false);
  const [isEditMedicalOpen, setIsEditMedicalOpen] = useState(false);

  // Use Inertia's useForm for validation/errors
  const form = useForm({
    gestational_age_weeks: "",
    last_menstrual_period: "",
    expected_delivery_date: "",
    weight: "",
    blood_pressure: "",
    fetal_heart_rate: "",
    uterine_height: "",
    symptoms: "",
    clinical_observations: "",
    prescription: "",
    recommendations: "",
    next_visit_date: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route("patients.report.store", { patient: patient.id }), {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset(); // clear form after success
      },
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Crm Tools", href: "#" },
        { title: "Patients", href: "#" },
        { title: patient.first_name + " " + patient.last_name, href: "#" },
      ]}
    >
      <Head title="Détails Patient" />

      <div className="px-6 py-6 space-y-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Information du Patient</h3>
          </div>

        {/* ================= PATIENT INFO CARD ================= */}
        <div className="p-0 overflow-hidden">
          {/* ================= PATIENT INFO SECTION ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ================= BASIC INFORMATION ================= */}
            <Card className="bg-sidebar">

              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Informations de base</CardTitle>
                  <CardDescription>
                    Informations personnelles du patient
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setIsEditBasicOpen(true)}
                >
                  <SquarePen className="w-4 h-4 mr-2" />Modifier
                </Button>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Prénom" value={patient.first_name} />
                  <InfoItem label="Nom" value={patient.last_name} />
                  <InfoItem label="Téléphone" value={patient.phone} />
                  <InfoItem label="Email" value={patient.email ?? "—"} />
                  <InfoItem label="Adresse" value={patient.address ?? "—"} />
                  <InfoItem
                    label="Date de naissance"
                    value={
                      patient.date_of_birth
                        ? new Date(patient.date_of_birth).toLocaleDateString("fr-FR")
                        : "—"
                    }
                  />
                  <InfoItem label="CIN" value={patient.cin ?? "—"} />
                  <InfoItem
                    label="Créé le"
                    value={new Date(patient.created_at).toLocaleDateString("fr-FR")}
                  />
                </div>
              </CardContent>

            </Card>

            {/* ================= MEDICAL INFORMATION ================= */}
            <Card className="bg-sidebar">

              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Informations médicales</CardTitle>
                  <CardDescription>
                    Données médicales et antécédents
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setIsEditMedicalOpen(true)}
                >
                  <SquarePen className="w-4 h-4 mr-2" />Modifier
                </Button>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Groupe sanguin" value={patient.blood_group ?? "—"} />
                  <InfoItem label="Allergies" value={patient.allergies ?? "—"} />
                  <InfoItem label="Maladies chroniques" value={patient.chronic_diseases ?? "—"} />

                  <div>
                    <p className="text-sm text-muted-foreground">Grossesse</p>
                    <Badge
                      className="mt-1 text-xs"
                      variant={patient.is_pregnant ? "default" : "outline"}
                    >
                      {patient.is_pregnant ? "Oui" : "Non"}
                    </Badge>
                  </div>

                  <div className="sm:col-span-2">
                    <InfoItem label="Notes" value={patient.notes ?? "—"} />
                  </div>
                </div>
              </CardContent>

            </Card>

          </div>
        </div>

        {/* ================= REPORTS SECTION ================= */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Rapports</h3>
            <Button onClick={() => setIsDialogOpen(true)}> <Plus className="w-4 h-4 mr-2" /> Ajouter un Rapport</Button>
          </div>

          {reports.length === 0 && (
            <p className="text-muted-foreground">Aucun rapport disponible.</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="p-6 space-y-3 bg-sidebar">
                <ReportItem label="Âge gestationnel" value={`${report.gestational_age_weeks ?? "—"} semaines`} />
                <ReportItem label="Dernières règles" value={report.last_menstrual_period ?? "—"} />
                <ReportItem label="Date prévue d'accouchement" value={report.expected_delivery_date ?? "—"} />
                <ReportItem label="Poids" value={`${report.weight ?? "—"} kg`} />
                <ReportItem label="Tension" value={report.blood_pressure ?? "—"} />
                <ReportItem label="Rythme cardiaque fœtal" value={`${report.fetal_heart_rate ?? "—"} bpm`} />
                <ReportItem label="Hauteur utérine" value={`${report.uterine_height ?? "—"} cm`} />
                <ReportItem label="Symptômes" value={report.symptoms ?? "—"} />
                <ReportItem label="Observations cliniques" value={report.clinical_observations ?? "—"} />
                <ReportItem label="Prescription" value={report.prescription ?? "—"} />
                <ReportItem label="Recommandations" value={report.recommendations ?? "—"} />
                <ReportItem label="Prochaine visite" value={report.next_visit_date ?? "—"} />
                <ReportItem label="Créé le" value={new Date(report.created_at).toLocaleDateString("fr-FR")} />
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* ================= CREATE REPORT MODAL ================= */}
      <NativeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <NativeDialogContent>
          <NativeDialogHeader>
            <NativeDialogTitle>Créer un nouveau rapport</NativeDialogTitle>
          </NativeDialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">

            <InputField label="Âge gestationnel" name="gestational_age_weeks" type="number" form={form} />
            <InputField label="Dernières règles" name="last_menstrual_period" type="date" form={form} />
            <InputField label="Date prévue d'accouchement" name="expected_delivery_date" type="date" form={form} />
            <InputField label="Poids (kg)" name="weight" type="number" step="0.1" form={form} />
            <InputField label="Tension" name="blood_pressure" type="text" form={form} />
            <InputField label="Rythme cardiaque fœtal" name="fetal_heart_rate" type="number" form={form} />
            <InputField label="Hauteur utérine (cm)" name="uterine_height" type="number" form={form} />
            <InputField label="Symptômes" name="symptoms" type="text" form={form} />
            <InputField label="Observations cliniques" name="clinical_observations" type="text" form={form} />
            <InputField label="Prescription" name="prescription" type="text" form={form} />
            <InputField label="Recommandations" name="recommendations" type="text" form={form} />
            <InputField label="Prochaine visite" name="next_visit_date" type="date" form={form} />

            <NativeDialogFooter>
              <Button type="submit">Créer</Button>
            </NativeDialogFooter>
          </form>
        </NativeDialogContent>
      </NativeDialog>

      {/* ================= UPDATE BASIC INFOS MODAL ================= */}
      <UpdatePatientBasicModal
        open={isEditBasicOpen}
        selectedPatient={patient}
        onOpenChange={setIsEditBasicOpen}
        onSuccess={() => {
          router.reload({ only: ["patient"] });
        }}
      />

      {/* ================= UPDATE MEDICAL INFOS MODAL ================= */}
      <UpdatePatientMedicalModal
        open={isEditMedicalOpen}
        selectedPatient={patient}
        onOpenChange={setIsEditMedicalOpen}
        onSuccess={() => {
          router.reload({ only: ["patient"] });
        }}
      />
    </AppLayout>
  );
}

/* ================= SMALL UI COMPONENTS ================= */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function ReportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ================= REUSABLE INPUT FIELD ================= */
function InputField({
  label,
  name,
  type = "text",
  step,
  form,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  form: any;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        value={form.data[name]}
        onChange={(e) => form.setData(name, e.target.value)}
      />
      {form.errors[name] && (
        <p className="text-red-500 text-sm mt-1">{form.errors[name]}</p>
      )}
    </div>
  );
}