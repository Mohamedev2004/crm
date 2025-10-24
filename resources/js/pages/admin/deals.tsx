"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn, Deal } from "@/components/admin/deals/columns";
import { DataTable } from "@/components/admin/deals/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data',
    href: route('admin.deals'),
  },
  {
    title: 'Deals',
    href: '/dashboard',
  },
];

interface DealsProps {
  deals?: Deal[];
  clients?: { id: number; name: string; role?: string }[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

export default function Deals({ deals = [], clients = [], auth }: DealsProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Filter out admins from clients
  const filteredClients = clients.length ? clients.filter(c => c.role !== "admin") : [];

  // Toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Update deal stage via Inertia
  const onSetStage = (deal: Deal, stage: string) => {
    router.post(
      route("admin.deals.setStage", { deal: deal.id, stage }),
      {},
      {
        onSuccess: () => showToastMessage(`Deal "${deal.title}" stage updated to ${stage}`, "success"),
        onError: () => showToastMessage(`Failed to update stage for "${deal.title}"`, "error"),
      }
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Deals" />

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg text-white animate-in fade-in slide-in-from-top-5 ${
            toastType === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Main Table */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Deals List</h1>

        <DataTable<Deal, unknown>
          columns={columnsFn({ onSetStage })}
          data={deals}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          clients={filteredClients} // only non-admin clients
        />
      </div>
    </AppLayout>
  );
}
