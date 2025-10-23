"use client";

import { useState } from "react";
import { columns, Revenue } from "@/components/admin/revenues/columns";
import { DataTable } from "@/components/admin/revenues/data-table";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data',
        href: route('admin.revenues'),
    },
    {
        title: 'Revenues',
        href: '/dashboard',
    },
];

interface RevenuesProps {
  revenues: Revenue[];
  deals?: { id: number; title: string }[];
  auth: { user: { role: "admin" | "client" | "commercial"; name: string } };
}

export default function Revenues({ revenues = [], deals = [], auth }: RevenuesProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Revenues" />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Revenues List</h1>

        <DataTable<Revenue, unknown>
          columns={columns()}
          data={revenues}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          deals={deals}
        />
      </div>
    </AppLayout>
  );
}
