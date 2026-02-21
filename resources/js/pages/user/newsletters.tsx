/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/order */
"use client";

import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { NewsletterDataTable } from "@/components/user/newsletters/data-table";
import { createNewsletterColumns, Newsletter } from "@/components/user/newsletters/columns";
import { toast } from "sonner";
import { CreateNewsletterModal } from "@/components/user/newsletters/create-newsletter-modal";
import { UpdateNewsletterModal } from "@/components/user/newsletters/update-newsletter-modal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Application", href: "#" },
  { title: "Newsletters", href: "/newsletters" },
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
  trashed?: "all" | "subscribed" | "unsubscribed";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
}

interface Props {
  newsletters: Pagination<Newsletter>;
  filters: Filters;
  flash?: { success?: string; error?: string };
}

export default function NewsletterIndex({ newsletters, filters, flash }: Props) {
  const pageData = newsletters.data ?? [];
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Newsletter | null>(null);

  // Open edit modal for selected subscriber
  const handleEdit = (newsletter: Newsletter) => {
    setSelectedSubscriber(newsletter);
    setIsEditOpen(true);
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Navigate table with filters/sorting/pagination
  const navigateWith = (partial: Partial<Filters & { page: number; perPage: number }>) => {
    const query = {
      search: partial.search ?? filters.search,
      trashed: partial.trashed ?? filters.trashed,
      sortBy: partial.sortBy ?? filters.sortBy,
      sortDir: partial.sortDir ?? filters.sortDir,
      page: partial.page ?? newsletters.current_page,
      perPage: partial.perPage ?? filters.perPage ?? newsletters.per_page,
    };

    router.get(route("newsletters.index"), query, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  // Delete / unsubscribe
  const handleDelete = (newsletter: Newsletter) => {
    router.delete(route("newsletters.destroy", newsletter.id), { preserveState: true });
  };

  // Restore
  const handleRestore = (newsletter: Newsletter) => {
    router.post(route("newsletters.restore", newsletter.id), {}, { preserveState: true });
  };

  // Restore all
  const handleRestoreAll = () => {
    router.post(route("newsletters.restore-all"), {}, { preserveState: true });
  };

  // Bulk delete
  const handleBulkDelete = (ids: string[]) => {
    router.post(route("newsletters.bulk-delete"), { ids }, {
      preserveState: true,
      onSuccess: () => setRowSelection({}),
    });
  };

  const hasSoftDeleted = pageData.some((n) => n.deleted_at !== null);

  // ✅ Correct order of columns: onDelete, onRestore, onEdit
  const columns = createNewsletterColumns(
    handleDelete,   // onDelete
    handleRestore,  // onRestore
    handleEdit,     // onEdit
    filters.sortBy,
    filters.sortDir,
    (sortBy, sortDir) => navigateWith({ sortBy, sortDir })
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Newsletters" />

      <div className="w-full px-6 py-4 mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Newsletters</h2>

        <NewsletterDataTable
          columns={columns}
          data={pageData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          hasSoftDeleted={hasSoftDeleted}
          onRestoreAllClick={handleRestoreAll}
          onBulkDelete={handleBulkDelete}
          filters={filters}
          pagination={{
            page: newsletters.current_page,
            pageCount: newsletters.last_page,
            perPage: newsletters.per_page,
          }}
          onFilterChange={(key, value) => navigateWith({ [key]: value })}
          onPerPageChange={(perPage) => navigateWith({ perPage, page: 1 })}
          onPageChange={(page) => navigateWith({ page })}
          onAddClick={() => setIsCreateOpen(true)}
        />

        {/* Create modal */}
        <CreateNewsletterModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => navigateWith({})}
        />

        {/* Update / Edit modal */}
        <UpdateNewsletterModal
          open={isEditOpen}
          selectedSubscriber={selectedSubscriber}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setSelectedSubscriber(null); // reset after close
          }}
          onSuccess={() => {
            navigateWith({});
        }}
        />
      </div>
    </AppLayout>
  );
}
