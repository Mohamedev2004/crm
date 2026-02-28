/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import type { BreadcrumbItem } from "@/types";
import { createContactColumns, type Contact } from "@/components/user/contacts/columns";
import { ContactsDataTable } from "@/components/user/contacts/data-table";
import { CreateContactModal } from "@/components/user/contacts/create-contact-modal";
import { UpdateContactModal } from "@/components/user/contacts/update-contact-modal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Formulaires", href: "#" },
  { title: "Contacts", href: "#" },
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
  status?: string; // new status filter
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
};

interface Props {
  contacts: Pagination<Contact>;
  filters: Filters;
}

export default function ContactsIndex({ contacts, filters }: Props) {
  const data = contacts.data ?? [];
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);

  const navigateWith = useCallback((params: Record<string, any>) => {
    router.get(route("contacts.index"), params, { preserveState: true, replace: true });
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

  const columns = useMemo(
    () =>
      createContactColumns({
        onEdit: (a) => {
          setSelected(a);
          setIsEditOpen(true);
        },
        onDelete: (contact) => {
          router.delete(route("contacts.destroy", contact.id), {
            preserveScroll: true,
            onSuccess: () => {
              router.reload({ only: ["contacts"] });
            },
          });
        },
        currentSortBy: filters.sortBy,
        currentSortDir: filters.sortDir as any,
        onSortChange: (sortBy, sortDir) =>
          navigateWith({ ...filters, sortBy, sortDir }),
      }),
    [filters, navigateWith]
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Contacts" />
      <div className="w-full px-6 mx-auto">
        {data.length > 0 && (
          <h2 className="text-2xl font-bold tracking-tight mt-4">Contacts</h2>
        )}

        <ContactsDataTable
          columns={columns}
          data={data}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          filters={filters}
          pagination={{
            page: contacts.current_page,
            pageCount: contacts.last_page,
            perPage: contacts.per_page,
          }}
          onFilterChange={onFilterChange}
          onPerPageChange={onPerPageChange}
          onPageChange={onPageChange}
          onAddClick={() => setIsCreateOpen(true)}
        />

        <CreateContactModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => router.reload({ only: ["contacts"] })}
        />

        <UpdateContactModal
          open={isEditOpen}
          onOpenChange={(v: boolean | ((prevState: boolean) => boolean)) => {
            setIsEditOpen(v);
            if (!v) setSelected(null);
          }}
          contact={selected}
          onSuccess={() => router.reload({ only: ["contacts"] })}
        />
      </div>
    </AppLayout>
  );
}
