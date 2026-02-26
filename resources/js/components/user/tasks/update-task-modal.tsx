"use client";

import { useState, useEffect } from "react";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogDescription,
  NativeDialogHeader,
  NativeDialogTitle,
} from "@/components/native-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTaskActions } from "@/components/user/tasks/tasks-actions";
import { type Task } from "@/components/user/tasks/columns";

interface Props {
  task: Task;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patients?: { id: number; name: string }[];
}

export function UpdateTaskModal({
  task,
  open,
  onOpenChange,
  patients = [],
}: Props) {
  const { updateTask } = useTaskActions();

  // Format to YYYY-MM-DDTHH:MM for input type="datetime-local"
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const normalized = dateStr.replace(" ", "T");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description ?? "",
    due_date: formatDateForInput(task.due_date),
    priority: task.priority,
    status: task.status,
    patient_id: task.patient_id ?? "",
  });

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description ?? "",
      due_date: formatDateForInput(task.due_date),
      priority: task.priority,
      status: task.status,
      patient_id: task.patient_id ?? "",
    });
  }, [task]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    updateTask(
      task.id,
      {
        ...formData,
        patient_id: formData.patient_id ? Number(formData.patient_id) : null,
      },
      () => onOpenChange(false)
    );
  };

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="w-full sm:max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Modifier la tâche</NativeDialogTitle>
          <NativeDialogDescription>
            Mettez à jour les détails de la tâche.
          </NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-6">
          {/* Title */}
          <div>
            <Label>Titre</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Due Date */}
          <div>
            <Label>Date d'échéance</Label>
            <Input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              required
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as Task["status"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  setFormData({ ...formData, priority: v as Task["priority"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Patient */}
          {patients.length > 0 && (
            <div>
              <Label>Assigner à un patient</Label>
              <Select
                value={formData.patient_id ? String(formData.patient_id) : "none"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    patient_id: v === "none" ? "" : Number(v),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
}
