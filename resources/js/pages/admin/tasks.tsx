"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { TaskColumn } from "@/components/TaskColumn";
import { DragOverlay } from "@/components/DragOverlay";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  start_date: string;
  due_date: string;
  user_id: number;
  created_at: string;
  updated_at: string;
};

interface TasksProps {
  tasks: Task[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Tasks", href: "/tasks" }];

const statuses: Record<Task["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export default function TaskBoard({ tasks: initialTasks = [], auth }: TasksProps) {
  const [tasks, setTasks] = useState<Record<Task["status"], Task[]>>(() => {
    const grouped: Record<Task["status"], Task[]> = {
      pending: [],
      in_progress: [],
      done: [],
      cancelled: [],
    };
    initialTasks.forEach((task) => grouped[task.status].push(task));
    return grouped;
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    start_date: "",
    due_date: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const grouped: Record<Task["status"], Task[]> = {
      pending: [],
      in_progress: [],
      done: [],
      cancelled: [],
    };
    initialTasks.forEach((task) => grouped[task.status].push(task));
    setTasks(grouped);
  }, [initialTasks]);

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

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = Number(event.active.id);
    const task = Object.values(tasks).flat().find((t) => t.id === activeId);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeId = Number(active.id);
  const overId = over.id;

  const activeTask = Object.values(tasks).flat().find((t) => t.id === activeId);
  if (!activeTask) return;

  const activeStatus = activeTask.status;
  let overStatus: Task["status"] | null = null;

  if (over.data.current?.type === "column") {
    overStatus = over.data.current.status as Task["status"];
  } else if (over.data.current?.type === "task") {
    const overTask = Object.values(tasks).flat().find((t) => t.id === Number(overId));
    if (overTask) overStatus = overTask.status;
  }

  // ✅ Prevent infinite re-render: Only update if task actually moves
  if (!overStatus || activeStatus === overStatus) return;

  setTasks((prev) => {
    // Only mutate if task really changed status
    if (prev[activeStatus].some((t) => t.id === activeId)) {
      const newActiveTasks = prev[activeStatus].filter((t) => t.id !== activeId);
      const newOverTasks = [...prev[overStatus!], { ...activeTask, status: overStatus! }];
      return { ...prev, [activeStatus]: newActiveTasks, [overStatus!]: newOverTasks };
    }
    return prev;
  });
};

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    const draggedTask = activeTask;
    setActiveTask(null);
    if (!over || !draggedTask) return;

    let toStatus: Task["status"] | null = null;
    if (over.data.current?.type === "column") {
      toStatus = over.data.current.status as Task["status"];
    } else if (over.data.current?.type === "task") {
      const overTask = Object.values(tasks).flat().find((t) => t.id === Number(over.id));
      if (overTask) toStatus = overTask.status;
    }

    if (toStatus && draggedTask.status !== toStatus) {
      router.put(
        route("admin.tasks.updateStatus", draggedTask.id),
        { status: toStatus },
        {
          preserveScroll: true,
          onSuccess: () => showToastMessage(`Task moved to ${statuses[toStatus!]}`, "success"),
          onError: () => showToastMessage("Failed to update task status", "error"),
        }
      );
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      showToastMessage("Title is required", "error");
      return;
    }

    router.post(route("admin.tasks.store"), newTask, {
      preserveScroll: true,
      onSuccess: () => {
        setShowModal(false);
        setNewTask({ title: "", description: "", priority: "medium", start_date: "", due_date: "" });
        showToastMessage("Task created successfully", "success");
      },
      onError: () => showToastMessage("Failed to create task", "error"),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Tasks" />
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg text-white ${
            toastType === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Task Board</h1>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={18} /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <Input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as Task["priority"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Object.entries(statuses).map(([statusKey, label]) => (
              <TaskColumn
                key={statusKey}
                status={statusKey as Task["status"]}
                label={label}
                tasks={tasks[statusKey as Task["status"]]}
              />
            ))}
          </div>
          <DragOverlay activeTask={activeTask} />
        </DndContext>
      </div>
    </AppLayout>
  );
}
