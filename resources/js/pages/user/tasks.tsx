/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { toast } from "sonner";
import CreateTaskDialog from "@/components/user/tasks/create-task-modal";
import { TasksDataTable } from "@/components/user/tasks/data-table";
import { createTaskColumns, type Task as DataTableTask } from "@/components/user/tasks/columns";
import { UpdateTaskModal } from "@/components/user/tasks/update-task-modal";    
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "in_progress" | "done" | "overdue";
  priority: "low" | "medium" | "high";
  patient_id: number | null;
  created_at: string;
  updated_at: string;
};

interface PaginatedTasks {
  data: Task[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface TasksProps {
  tasks: PaginatedTasks;
  patients: { id: number; first_name: string; last_name: string }[];
  filters: {
    status?: string;
    priority?: string;
    category?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    perPage?: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Crm Tools", href: '#' },
  { title: "Tâches", href: "#" },
];

export default function DailyTasks({ tasks: initialTasks, patients, filters }: TasksProps) {
  const [editTask, setEditTask] = useState<DataTableTask | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const navigateWith = (params: Record<string, any>) => {
    router.get(route("tasks.index"), params, {
      preserveState: true,
      replace: true,
    });
  };

  // Actions DataTable
  const handleUpdateClick = (task: DataTableTask) => {
    setEditTask(task);
    setEditOpen(true);
  };

  const handleSetPending = (task: DataTableTask) =>
    router.put(route("tasks.updateStatus", task.id), { status: "pending" });

  const handleSetInProgress = (task: DataTableTask) =>
    router.put(route("tasks.updateStatus", task.id), { status: "in_progress" });

  const handleSetDone = (task: DataTableTask) =>
    router.put(route("tasks.updateStatus", task.id), { status: "done" });

  const handleBulkSetPending = (ids: string[]) => {
    if (!ids.length) return;

    router.post(route("tasks.setSelectedPending"), { task_ids: ids.map(Number) }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Les tâches sélectionnées sont passées en attente");
        router.reload();
      },
      onError: () => toast.error("Échec de la mise à jour des tâches sélectionnées"),
    });
  };

  const handleBulkSetInProgress = (ids: string[]) => {
    if (!ids.length) return;

    router.post(route("tasks.setSelectedInProgress"), { task_ids: ids.map(Number) }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Les tâches sélectionnées sont passées en cours");
        router.reload();
      },
      onError: () => toast.error("Échec de la mise à jour des tâches sélectionnées"),
    });
  };

  const handleBulkSetDone = (ids: string[]) => {
    if (!ids.length) return;

    router.post(route("tasks.setSelectedDone"), { task_ids: ids.map(Number) }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Les tâches sélectionnées sont marquées terminées");
        router.reload();
      },
      onError: () => toast.error("Échec de la mise à jour des tâches sélectionnées"),
    });
  };

  const columns = createTaskColumns(
    handleUpdateClick,
    handleSetPending,
    handleSetInProgress,
    handleSetDone,
    filters.sortBy,
    filters.sortDir,
    (sortBy, sortDir) => navigateWith({ sortBy, sortDir })
  );

  const hasTasks = initialTasks.data.length > 0;
  const formattedPatients = patients.map((p) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
  }));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tâches" />
      <div className="w-full px-6 mx-auto">
        {hasTasks && (
          <h2 className="text-2xl font-bold tracking-tight mt-4">
            Tâches
          </h2>
        )}

        {initialTasks.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-foreground">
                  <ListChecks className="text-background" />
                </EmptyMedia>
                <EmptyTitle>Aucune tâche trouvée</EmptyTitle>
                <EmptyDescription>
                  Vous n'avez aucune tâche pour le moment ou les filtres appliqués n'ont retourné aucun résultat. Commencez par en ajouter une.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Ajouter une tâche
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <TasksDataTable<DataTableTask, unknown>
            columns={columns}
            data={initialTasks.data as unknown as DataTableTask[]}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            onAddClick={() => setIsCreateOpen(true)}
            onSetSelectedPending={handleBulkSetPending}
            onSetSelectedInProgress={handleBulkSetInProgress}
            onSetSelectedDone={handleBulkSetDone}
            filters={filters}
            pagination={{
              page: initialTasks.current_page,
              pageCount: initialTasks.last_page,
              perPage: initialTasks.per_page,
            }}
            onFilterChange={(key, value) =>
              navigateWith({ ...filters, [key]: value === "all" ? undefined : value })
            }
            onPerPageChange={(perPage) =>
              navigateWith({ ...filters, perPage, page: 1 })
            }
            onPageChange={(page) =>
              navigateWith({ ...filters, page })
            }
          />
        )}
      </div>

      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTaskCreated={() => router.reload()}
        patients={formattedPatients}
      />

      {editTask && (
        <UpdateTaskModal
          task={editTask}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditTask(null);
          }}
          patients={formattedPatients}
        />
      )}
    </AppLayout>
  );
}