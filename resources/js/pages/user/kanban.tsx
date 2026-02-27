/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";
import AppLayout from "@/layouts/app-layout";
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Head, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateTaskSheet from "@/components/user/tasks/create-task-modal";
import { BoardColumn, Column } from "@/components/user/kanban/board-column";
import { Task, TaskCard } from "@/components/user/kanban/task-card";
import { BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";

// --- Initial Data ---

const initialColumns: Column[] = [
  { id: "pending", title: "En attente" },
  { id: "in_progress", title: "En cours" },
  { id: "done", title: "Terminé" },
  { id: "overdue", title: "En retard" },
];

// --- BreadCrumbs ---

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Crm Tools", href: '#' },
  { title: "Kanban", href: "#" },
];

// --- Components ---

interface KanbanBoardProps {
  initialTasks: Record<string, {
    data: Task[];
    current_page: number;
    last_page: number;
  }>;
  patients: { id: number; name: string }[];
}

export default function KanbanBoard({ initialTasks, patients }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Record<string, {
    currentPage: number;
    lastPage: number;
    loading: boolean;
  }>>({});
  
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  // Dialog State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<"pending" | "in_progress" | "done" | "overdue">("pending");

  const createPendingTask = () => {
    setCreateModalStatus("pending");
    setIsCreateModalOpen(true);
  };

  const createInProgressTask = () => {
    setCreateModalStatus("in_progress");
    setIsCreateModalOpen(true);
  };

  const createDoneTask = () => {
    setCreateModalStatus("done");
    setIsCreateModalOpen(true);
  };

  const onTaskCreated = () => {
    router.reload({ only: ["initialTasks"] });
  };

  useEffect(() => {
    if (initialTasks) {
      const allTasks: Task[] = [];
      const newPagination: Record<string, any> = {};

      Object.entries(initialTasks).forEach(([status, paginated]) => {
        const tasksWithUiData = paginated.data.map((task) => ({
          ...task,
          tags: (task as any).tags || ["Task"],
          comments: (task as any).comments || 0,
          attachments: (task as any).attachments || 0,
          assignees: (task as any).assignees || ["/avatars/01.png"],
          patient: task.patient || null,
        }));
        allTasks.push(...tasksWithUiData);
        
        newPagination[status] = {
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          loading: false,
        };
      });

      setTasks(allTasks);
      setPagination(newPagination);
      setTimeout(() => setLoading(false), 500);
    }
  }, [initialTasks]);

  const loadMoreTasks = async (status: string) => {
    const statusPagination = pagination[status];
    if (!statusPagination || statusPagination.loading || statusPagination.currentPage >= statusPagination.lastPage) {
      return;
    }

    setPagination(prev => ({
      ...prev,
      [status]: { ...prev[status], loading: true }
    }));

    try {
      const response = await fetch(
        route('kanban.index', { status, page: statusPagination.currentPage + 1 })
      );
      const data = await response.json();

      if (data.tasks) {
        const newTasks = data.tasks.data.map((task: any) => ({
          ...task,
          tags: task.tags || ["Task"],
          comments: task.comments || 0,
          attachments: task.attachments || 0,
          assignees: task.assignees || ["/avatars/01.png"],
          patient: task.patient || null,
        }));

        setTasks(prev => [...prev, ...newTasks]);
        setPagination(prev => ({
          ...prev,
          [status]: {
            currentPage: data.tasks.current_page,
            lastPage: data.tasks.last_page,
            loading: false,
          }
        }));
      }
    } catch (error) {
      console.error("Failed to load more tasks:", error);
      setPagination(prev => ({
        ...prev,
        [status]: { ...prev[status], loading: false }
      }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // slightly higher = less accidental drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      const task = event.active.data.current.task;
      setActiveTask(task);
      setOriginalStatus(task.status);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    setTasks((prevTasks) => {
      const activeIndex = prevTasks.findIndex((t) => t.id === active.id);
      if (activeIndex === -1) return prevTasks;

      const activeTask = prevTasks[activeIndex];

      // Dropping over task
      if (isOverTask) {
        const overIndex = prevTasks.findIndex((t) => t.id === over.id);
        if (overIndex === -1) return prevTasks;

        const overTask = prevTasks[overIndex];

        if (overTask.status === "overdue") return prevTasks;

        const updatedTasks = [...prevTasks];

        // Only update status if needed
        if (activeTask.status !== overTask.status) {
          updatedTasks[activeIndex] = {
            ...activeTask,
            status: overTask.status,
          };
        }

        return arrayMove(updatedTasks, activeIndex, overIndex);
      }

      // Dropping over column
      if (isOverColumn) {
        const columnId = over.id as "pending" | "in_progress" | "done" | "overdue";
        if (columnId === "overdue") return prevTasks;

        if (activeTask.status === columnId) return prevTasks;

        const updatedTasks = [...prevTasks];
        updatedTasks[activeIndex] = {
          ...activeTask,
          status: columnId,
        };

        return updatedTasks;
      }

      return prevTasks;
    });
  }


  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      setOriginalStatus(null);
      return;
    }

    if (active.data.current?.type === "Column") {
      setColumns((cols) => {
        const oldIndex = cols.findIndex((c) => c.id === active.id);
        const newIndex = cols.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return cols;
        return arrayMove(cols, oldIndex, newIndex);
      });
      return;
    }

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) {
      setOriginalStatus(null);
      return;
    }

    const task = tasks.find((t) => t.id === active.id);
    if (!task) {
      setOriginalStatus(null);
      return;
    }

    if (originalStatus && task.status !== originalStatus) {
      const previousTasks = [...tasks];

      router.patch(
        route("kanban.updateStatus", { task: task.id }),
        { status: task.status },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Statut mis à jour avec succès");
          },
          onError: () => {
            toast.error("Erreur lors de la mise à jour du statut");

            // Full rollback
            setTasks(
              previousTasks.map((t) =>
                t.id === task.id ? { ...t, status: originalStatus as "pending" | "in_progress" | "done" | "overdue" } : t
              )
            );
          },
        }
      );
    }

    setOriginalStatus(null);
  }


  const dropAnimation: DropAnimation = {
    duration: 250,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kanban" />
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden">
        <div className="w-full px-6 mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mt-4">
            Kanban des Tâches
          </h2>
        </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full gap-6 overflow-x-auto pb-4 p-6">
          <SortableContext
            items={columnsId}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col) => {
              let onAddTask;
              if (col.id === "pending") onAddTask = createPendingTask;
              if (col.id === "in_progress") onAddTask = createInProgressTask;
              if (col.id === "done") onAddTask = createDoneTask;

              return (
                <div key={col.id} className="h-full flex flex-col">
                  <BoardColumn
                    column={col}
                    tasks={filteredTasks.filter((task) => task.status === col.id)}
                    loading={loading}
                    onAddTask={onAddTask}
                  />
                  {pagination[col.id]?.currentPage < pagination[col.id]?.lastPage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => loadMoreTasks(col.id as string)}
                      disabled={pagination[col.id]?.loading}
                    >
                      {pagination[col.id]?.loading ? "Chargement..." : "Charger plus"}
                    </Button>
                  )}
                </div>
              );
            })}
          </SortableContext>
        </div>

        <CreateTaskSheet
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onTaskCreated={onTaskCreated}
          patients={patients}
          initialStatus={createModalStatus}
        />

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeColumn && (
            <BoardColumn
              column={activeColumn}
              tasks={tasks.filter((task) => task.status === activeColumn.id)}
              isOverlay
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
      </div>
    </AppLayout>
  );
}