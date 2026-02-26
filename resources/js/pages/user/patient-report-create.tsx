/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
"use client";

import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Props {
  patient: Patient;
}

export default function PatientReportCreate({ patient }: Props) {
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
        toast.success("Rapport médical créé avec succès");
      },
      onError: () => {
        toast.error("Erreur lors de la création du rapport");
      },
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Patients", href: route("patients.index") },
        {
          title: patient.first_name + " " + patient.last_name,
          href: route("patients.show", patient.id),
        },
        { title: "Nouveau Rapport", href: "#" },
      ]}
    >
      <Head title={`Nouveau Rapport - ${patient.first_name} ${patient.last_name}`} />

      <div className="px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">

            <h1 className="text-2xl font-bold tracking-tight mt-4">Nouveau Rapport Médical</h1>
            <p className="text-muted-foreground text-sm">
              Enregistrer une nouvelle consultation pour {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mb-10">
          {/* Section: Grossesse & Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 shadow-sm border-none bg-sidebar">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">

                   Suivi de Grossesse
                </CardTitle>
                <CardDescription>Informations temporelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField label="Âge gestationnel (semaines)" name="gestational_age_weeks" type="number" form={form} />
                <InputField label="Dernières règles" name="last_menstrual_period" type="date" form={form} />
                <InputField label="Date d'accouchement prévue" name="expected_delivery_date" type="date" form={form} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-sm border-none bg-sidebar">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">

                   Paramètres Vitaux
                </CardTitle>
                <CardDescription>Données biométriques et cardiaques</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Poids (kg)" name="weight" type="number" step="0.1" form={form} />
                <InputField label="Tension Artérielle" name="blood_pressure" type="text" form={form} />
                <InputField label="Rythme cardiaque fœtal (bpm)" name="fetal_heart_rate" type="number" form={form} />
                <InputField label="Hauteur utérine (cm)" name="uterine_height" type="number" form={form} />
              </CardContent>
            </Card>
          </div>

          {/* Section: Observations & Prescription */}
          <Card className="shadow-sm border-none bg-sidebar">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                 Observations & Plan Thérapeutique
              </CardTitle>
              <CardDescription>Détails de la consultation et recommandations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TextAreaField label="Symptômes rapportés" name="symptoms" form={form} />
                <TextAreaField label="Observations cliniques" name="clinical_observations" form={form} />
                <div className="md:col-span-2">
                  <Separator className="my-2" />
                </div>
                <TextAreaField label="Prescription médicale" name="prescription" form={form} />
                <TextAreaField label="Recommandations" name="recommendations" form={form} />
                <div className="md:col-span-2">
                  <Separator className="my-2" />
                </div>
                <div className="md:col-span-1">
                  <InputField label="Date de la prochaine visite" name="next_visit_date" type="date" form={form} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions (Floating on mobile, fixed bottom on large) */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 lg:relative lg:bg-transparent lg:border-none lg:p-0 flex justify-end gap-4">
            <Link href={route("patients.show", patient.id)}>
              <Button type="button" variant="outline" className="px-8">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={form.processing}
            >
              {form.processing ? "Enregistrement..." : "Enregistrer le rapport"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

function InputField({ label, name, type = "text", step, form }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        value={form.data[name]}
        onChange={(e) => form.setData(name, e.target.value)}
      />
      {form.errors[name] && (
        <p className="text-destructive text-[11px] font-medium mt-1">{form.errors[name]}</p>
      )}
    </div>
  );
}

function TextAreaField({ label, name, form }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        value={form.data[name]}
        onChange={(e) => form.setData(name, e.target.value)}
      />
      {form.errors[name] && (
        <p className="text-destructive text-[11px] font-medium mt-1">{form.errors[name]}</p>
      )}
    </div>
  );
}
