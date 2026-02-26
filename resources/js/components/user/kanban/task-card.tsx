/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock } from "lucide-react";

export type Id = string | number;

export type Task = {
  id: Id;
  status: "pending" | "in_progress" | "done" | "overdue";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  patient?: {
    id: number;
    name: string;
    avatar?: string;
  } | null;
};

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: task.status === "overdue",
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  const priorityLabels = {
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString.replace(" ", "T"));
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border/40 bg-background/70 p-4 shadow-lg backdrop-blur-xl transition-all hover:border-border/60 hover:shadow-xl hover:-translate-y-1",
        task.status !== "overdue" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging && "opacity-30",
        isOverlay && "rotate-2 scale-105 shadow-2xl cursor-grabbing opacity-100 bg-background/90 backdrop-blur-xl z-50"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "border px-1.5 py-0.5 text-[10px] tracking-wider backdrop-blur-sm",
              priorityColors[task.priority]
            )}
          >
            {priorityLabels[task.priority]}
          </Badge>
        </div>
      </div>

      <p className="relative z-10 text-sm font-medium text-foreground leading-relaxed">
        {task.title}
      </p>

      {task.description && (
        <p className="relative z-10 text-xs text-foreground leading-relaxed truncate">
          {task.description}
        </p>
      )}

      <div className="relative z-10 flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 text-xs text-foreground/50">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        {task.patient && (
          <div className="flex -space-x-2">
            <Badge className="text-[8px] bg-primary/10 text-primary">{task.patient.name}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
