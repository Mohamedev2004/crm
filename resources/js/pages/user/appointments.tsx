/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import type { BreadcrumbItem } from "@/types";
import { createAppointmentColumns, type Appointment } from "@/components/user/appointments/columns";
import { AppointmentsDataTable } from "@/components/user/appointments/data-table";
import { CreateAppointmentModal } from "@/components/user/appointments/create-appointment-modal";
import { UpdateAppointmentModal } from "@/components/user/appointments/update-appointment-modal";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Crm Tools", href: "#" },
  { title: "Rendez-vous", href: "#" },
];

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type Filters = {
  search?: string;
  trashed?: "all" | "actifs" | "deleted";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
};

interface Props {
  appointments: Pagination<Appointment>;
  filters: Filters;
}

export default function AppointmentsIndex({ appointments, filters }: Props) {
  const data = appointments.data ?? [];
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const navigateWith = useCallback((params: Record<string, any>) => {
    router.get(route("appointments.index"), params, { preserveState: true, replace: true });
  }, []);

  const onFilterChange = useCallback(
    (key: keyof Filters, value: any) => {
      navigateWith({ ...filters, [key]: value, page: 1 });
    },
    [filters, navigateWith]
  );

  const onPageChange = useCallback(
    (page: number) => navigateWith({ ...filters, page }),
    [filters, navigateWith]
  );

  const onPerPageChange = useCallback(
    (perPage: number) => navigateWith({ ...filters, perPage, page: 1 }),
    [filters, navigateWith]
  );

  const handleConfirm = useCallback((a: Appointment) => {
    router.post(route("appointments.setConfirmed", a.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Rendez-vous confirmé"),
      onError: () => toast.error("Échec de la confirmation"),
    });
  }, []);

  const handleComplete = useCallback((a: Appointment) => {
    router.post(route("appointments.setCompleted", a.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Rendez-vous terminé"),
      onError: () => toast.error("Échec de l'opération"),
    });
  }, []);

  const handleCancel = useCallback((a: Appointment) => {
    router.post(route("appointments.setCancelled", a.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Rendez-vous annulé"),
      onError: () => toast.error("Échec de l'annulation"),
    });
  }, []);

  const handleConfirmMany = useCallback((ids: number[]) => {
    router.post(route("appointments.confirmMany"), { appointment_ids: ids }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Rendez-vous confirmés");
        setRowSelection({});
        router.reload({ only: ["appointments"] });
      },
      onError: () => toast.error("Échec de la confirmation groupée"),
    });
  }, []);

  const handleCancelMany = useCallback((ids: number[]) => {
    router.post(route("appointments.cancelMany"), { appointment_ids: ids }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Rendez-vous annulés");
        setRowSelection({});
        router.reload({ only: ["appointments"] });
      },
      onError: () => toast.error("Échec de l'annulation groupée"),
    });
  }, []);

  const handleCompleteMany = useCallback((ids: number[]) => {
    router.post(route("appointments.completeMany"), { appointment_ids: ids }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Rendez-vous marqués comme terminés");
        setRowSelection({});
        router.reload({ only: ["appointments"] });
      },
      onError: () => toast.error("Échec de l'opération groupée"),
    });
  }, []);

  const columns = useMemo(
    () =>
      createAppointmentColumns({
        onConfirm: (a) => handleConfirm(a),
        onComplete: (a) => handleComplete(a),
        onCancel: (a) => handleCancel(a),
        onEdit: (a) => {
          setSelected(a);
          setIsEditOpen(true);
        },
        currentSortBy: filters.sortBy,
        currentSortDir: filters.sortDir as any,
        onSortChange: (sortBy, sortDir) => navigateWith({ ...filters, sortBy, sortDir }),
      }),
    [filters, handleCancel, handleComplete, handleConfirm, navigateWith]
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rendez-vous" />
      <div className="w-full px-6 mx-auto">
        {data.length > 0 && (
          <h2 className="text-2xl font-bold tracking-tight mt-4">Rendez-vous</h2>
        )}

        <AppointmentsDataTable
          columns={columns}
          data={data}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          filters={filters}
          pagination={{
            page: appointments.current_page,
            pageCount: appointments.last_page,
            perPage: appointments.per_page,
          }}
          onFilterChange={onFilterChange}
          onPerPageChange={onPerPageChange}
          onPageChange={onPageChange}
          onAddClick={() => setIsCreateOpen(true)}
          onConfirmMany={handleConfirmMany}
          onCancelMany={handleCancelMany}
          onCompleteMany={handleCompleteMany}
        />

        <CreateAppointmentModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => router.reload({ only: ["appointments"] })}
        />

        <UpdateAppointmentModal
          open={isEditOpen}
          onOpenChange={(v) => {
            setIsEditOpen(v);
            if (!v) setSelected(null);
          }}
          appointment={selected}
          onSuccess={() => router.reload({ only: ["appointments"] })}
        />
      </div>
    </AppLayout>
  );
}

