/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/order */
"use client";

import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { PatientDataTable } from "@/components/user/patients/data-table";
import { createPatientColumns } from "@/components/user/patients/columns";
import type { Patient } from "@/types/patient";
import { CreatePatientModal } from "@/components/user/patients/create-patient-modal";
import { UpdatePatientBasicModal } from "@/components/user/patients/update-patient-basic-infos-modal";
import { UpdatePatientMedicalModal } from "@/components/user/patients/update-patient-medical-infos-modal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Crm Tools", href: "#" },
  { title: "Patients", href: "/patients" },
];

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  search?: string;
  trashed?: "all" | "only";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
}

interface Props {
  patients: Pagination<Patient>;
  filters: Filters;
  flash?: { success?: string; error?: string };
}

export default function PatientIndex({ patients, filters, flash }: Props) {
  const pageData = patients.data ?? [];

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditMedicalOpen, setIsEditMedicalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // =============================
  // Handlers
  // =============================

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };

  const handleEditMedical = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMedicalOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    router.delete(route("patients.destroy", patient.id), {
      preserveState: true,
    });
  };

  const handleRestore = (patient: Patient) => {
    router.post(route("patients.restore", patient.id), {}, {
      preserveState: true,
    });
  };

  const handleRestoreAll = () => {
    router.post(route("patients.restore-all"), {}, {
      preserveState: true,
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    router.post(route("patients.bulk-delete"), { ids }, {
      preserveState: true,
      onSuccess: () => setRowSelection({}),
    });
  };

  // =============================
  // Flash messages
  // =============================

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // =============================
  // Navigation
  // =============================

  const navigateWith = (
    partial: Partial<Filters & { page: number; perPage: number }>
  ) => {
    const query = {
      search: partial.search ?? filters.search,
      trashed: partial.trashed ?? filters.trashed,
      sortBy: partial.sortBy ?? filters.sortBy,
      sortDir: partial.sortDir ?? filters.sortDir,
      page: partial.page ?? patients.current_page,
      perPage: partial.perPage ?? filters.perPage ?? patients.per_page,
    };

    router.get(route("patients.index"), query, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const hasSoftDeleted = pageData.some((p) => p.deleted_at !== null);
  const hasPatients = pageData.length > 0;

  const columns = createPatientColumns({
    onDelete: handleDelete,
    onRestore: handleRestore,
    onEdit: handleEdit,
    onEditMedical: handleEditMedical,
    currentSortBy: filters.sortBy,
    currentSortDir: filters.sortDir,
    onSortChange: (sortBy: string, sortDir: "asc" | "desc") =>
      navigateWith({ sortBy, sortDir }),
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Patients" />

      <div className="w-full px-6 mx-auto">
        {hasPatients && (
          <h2 className="text-2xl font-bold tracking-tight mt-4">
            Patients
          </h2>
        )}

        <PatientDataTable
          columns={columns}
          data={pageData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          hasSoftDeleted={hasSoftDeleted}
          onRestoreAllClick={handleRestoreAll}
          onBulkDelete={handleBulkDelete}
          filters={filters}
          pagination={{
            page: patients.current_page,
            pageCount: patients.last_page,
            perPage: patients.per_page,
          }}
          onFilterChange={(key, value) => navigateWith({ [key]: value })}
          onPerPageChange={(perPage) => navigateWith({ perPage, page: 1 })}
          onPageChange={(page) => navigateWith({ page })}
          onAddClick={() => setIsCreateOpen(true)}
        />

        <CreatePatientModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => navigateWith({})}
        />

        <UpdatePatientBasicModal
          open={isEditOpen}
          selectedPatient={selectedPatient}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setSelectedPatient(null);
          }}
          onSuccess={() => navigateWith({})}
        />

        <UpdatePatientMedicalModal
          open={isEditMedicalOpen}
          selectedPatient={selectedPatient}
          onOpenChange={(open) => {
            setIsEditMedicalOpen(open);
            if (!open) setSelectedPatient(null);
          }}
          onSuccess={() => navigateWith({})}
        />
      </div>
    </AppLayout>
  );
}