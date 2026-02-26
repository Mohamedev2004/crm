"use client";

import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { type Task } from "@/components/user/tasks/columns";

export function useTaskActions() {
  const updateTask = (taskId: number, data: Partial<Task>, onSuccess?: () => void) => {
    router.put(route("tasks.update", taskId), data, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Task updated successfully");
        onSuccess?.();
      },
      onError: () => toast.error("Failed to update task"),
    });
  };

  const deleteTask = (taskId: number, onSuccess?: () => void) => {
    router.delete(route("tasks.destroy", taskId), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Task deleted");
        onSuccess?.();
      },
      onError: () => toast.error("Failed to delete task"),
    });
  };

  return { updateTask, deleteTask };
}
