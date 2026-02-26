/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
"use client";

import { useState, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Plus, SquarePen } from "lucide-react";
import { UpdatePatientBasicModal } from "@/components/user/patients/update-patient-basic-infos-modal";
import { UpdatePatientMedicalModal } from "@/components/user/patients/update-patient-medical-infos-modal";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReportDataTable } from "@/components/user/patient-reports/data-table";
import { createReportColumns } from "@/components/user/patient-reports/columns";

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
}

interface Props {
  patient: Patient;
  reports: any; // paginated reports from backend
  filters: {
    search?: string;
    sortBy?: string;
    sortDir?: string;
    perPage?: number;
  };
}

export default function PatientDetails({ patient, reports, filters }: Props) {
  const handleSortChange = useCallback((sortBy: string, sortDir: "asc" | "desc") => {
    router.get(
      route("patients.show", patient.id),
      {
        ...filters,
        sortBy,
        sortDir,
        page: 1,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, [patient.id, filters]);

  const reportData = reports.data ?? [];
  const columns = createReportColumns(
    patient.id,
    filters.sortBy,
    filters.sortDir as "asc" | "desc",
    handleSortChange
  );

  const [isEditBasicOpen, setIsEditBasicOpen] = useState(false);
  const [isEditMedicalOpen, setIsEditMedicalOpen] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string | number) => {
    router.get(
      route("patients.show", patient.id),
      {
        ...filters,
        [key]: value,
        page: 1,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, [patient.id, filters]);

  const handlePageChange = useCallback((page: number) => {
    router.get(
      route("patients.show", patient.id),
      {
        ...filters,
        page,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, [patient.id, filters]);

  const handlePerPageChange = useCallback((perPage: number) => {
    router.get(
      route("patients.show", patient.id),
      {
        ...filters,
        perPage,
        page: 1,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, [patient.id, filters]);

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Patients", href: "#" },
        { title: patient.first_name + " " + patient.last_name, href: "#" },
      ]}
    >
      <Head title="Détails Patient" />

      <div className="px-6 py-6 space-y-8">
        <h3 className="text-xl font-semibold mb-4">Informations de {patient.first_name} {patient.last_name}</h3>
        {/* ================= PATIENT INFO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-sidebar">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>
                  Informations personnelles du patient
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsEditBasicOpen(true)}>
                <SquarePen className="w-4 h-4 mr-2" />
                Modifier
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
                      ? new Date(patient.date_of_birth).toLocaleDateString(
                          "fr-FR"
                        )
                      : "—"
                  }
                />
                <InfoItem label="CIN" value={patient.cin ?? "—"} />
                <InfoItem
                  label="Créé le"
                  value={new Date(patient.created_at).toLocaleDateString(
                    "fr-FR"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-sidebar">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Informations médicales</CardTitle>
                <CardDescription>
                  Données médicales et antécédents
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsEditMedicalOpen(true)}>
                <SquarePen className="w-4 h-4 mr-2" />
                Modifier
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

        {/* ================= REPORTS SECTION ================= */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Rapports</h3>

          {reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon" className="bg-foreground">
                            <Folder className="text-background" />
                          </EmptyMedia>
                          <EmptyTitle>Aucun rapport trouvé</EmptyTitle>
                          <EmptyDescription>
                            Vous n'avez aucun rapport pour ce client ou les filtres appliqués sont introuvables. Commencez par en ajouter un.
                          </EmptyDescription>
                        </EmptyHeader>
            
                          <EmptyContent className="flex-row justify-center gap-2">
                            <Button onClick={() => router.visit(route("patients.report.create", patient.id))}>
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter un Rapport
                            </Button>
                          </EmptyContent>
                      </Empty>
                    </div>
          ) : (
            <ReportDataTable
              columns={columns}
              data={reportData}
              filters={filters}
              pagination={{
                page: reports.current_page,
                pageCount: reports.last_page,
                perPage: reports.per_page,
              }}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onAddClick={() => router.visit(route("patients.report.create", patient.id))}
            />
          )}
        </div>
      </div>

      <UpdatePatientBasicModal
        open={isEditBasicOpen}
        selectedPatient={patient}
        onOpenChange={setIsEditBasicOpen}
        onSuccess={() => router.reload({ only: ["patient"] })}
      />

      <UpdatePatientMedicalModal
        open={isEditMedicalOpen}
        selectedPatient={patient}
        onOpenChange={setIsEditMedicalOpen}
        onSuccess={() => router.reload({ only: ["patient"] })}
      />
    </AppLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}