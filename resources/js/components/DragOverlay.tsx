import { DragOverlay as DndDragOverlay } from "@dnd-kit/core";

type Task = {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "done" | "cancelled";
};

interface DragOverlayProps {
  activeTask: Task | null;
}

export function DragOverlay({ activeTask }: DragOverlayProps) {
  if (!activeTask) return null;

  const priorityColors: Record<Task["priority"], string> = {
    low: "bg-green-500/10 text-green-400 border border-green-500/30",
    medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    high: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  return (
    <DndDragOverlay>
      <div
        className={`rounded-xl p-4 shadow-xl ring-2 ring-black/30 dark:ring-white/30 w-[300px]
          bg-sidebar hover:bg-gray-200 dark:hover:bg-black/40 cursor-grabbing transition-all duration-200`}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1">
            {activeTask.title}
          </h4>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[activeTask.priority]}`}
          >
            {activeTask.priority}
          </span>
        </div>
        {activeTask.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {activeTask.description}
          </p>
        )}
      </div>
    </DndDragOverlay>
  );
}
