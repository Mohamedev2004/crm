/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Task, TaskCard } from "./task-card";

export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
  loading?: boolean;
  onAddTask?: () => void;
}

export function BoardColumn({ column, tasks, isOverlay, loading, onAddTask }: BoardColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: column.id === "overdue",
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/column relative flex h-full w-[350px] min-w-[350px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-sidebar backdrop-blur-xl shadow-lg",
        isDragging && "opacity-50",
        isOverlay && "rotate-2 scale-105 shadow-2xl cursor-grabbing bg-background/70"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/column:opacity-100" />

      <div
        {...attributes}
        {...listeners}
        className={cn(
          "relative z-10 flex items-center justify-between border-b border-border/30 bg-background/30 p-4 backdrop-blur-sm",
          column.id !== "overdue" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-2">
          <Badge variant='outline'>
            {loading ? <Skeleton className="h-3 w-3 rounded-full" /> : tasks.length}
          </Badge>
          <h3 className="font-semibold text-foreground">{column.title}</h3>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-3">
        <SortableContext
          items={tasksIds}
          strategy={verticalListSortingStrategy}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
        {!loading && onAddTask && (
          <Button
            variant="ghost"
            onClick={onAddTask}
            className="w-full justify-start gap-2 border border-dashed border-border/30 text-foreground/60 hover:text-foreground hover:bg-background/60 hover:border-border/50 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter une tâche
          </Button>
        )}
      </div>
    </div>
  );
}
