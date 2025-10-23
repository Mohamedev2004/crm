import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { Badge } from '@/components/ui/badge';

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  start_date: string;
  due_date: string;
};

interface TaskColumnProps {
  status: Task["status"];
  label: string;
  tasks: Task[];
}

export function TaskColumn({ status, label, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-sidebar rounded-xl p-4 min-w-[320px] max-w-[360px] shadow-md transition-all
        ${isOver ? "ring-2 ring-black/30 darl:ring-white/30" : ""}
      `}
      style={{ alignSelf: "flex-start" }} // 👈 this ensures natural height per column
    >
      {/* Header inside gray background */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold capitalize">{label}</h3>
        <Badge className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-22 text-gray-500 text-sm italic">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
