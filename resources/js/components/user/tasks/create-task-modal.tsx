"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogDescription,
  NativeDialogHeader,
  NativeDialogTitle,
  NativeDialogTrigger,
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
import { toast } from "sonner";
import { router } from "@inertiajs/react";

export type TaskPriority = "low" | "medium" | "high";

interface CreateTaskModalProps {
  onTaskCreated: () => void;
  patients?: { id: number; name: string }[];
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  initialStatus?: "pending" | "in_progress" | "done" | "overdue";
}

export default function CreateTaskSheet({
  onTaskCreated,
  patients = [],
  open,
  onOpenChange,
  initialStatus = "pending",
}: CreateTaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const currentSetOpen = isControlled ? onOpenChange : setInternalOpen;

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium" as TaskPriority,
    patient_id: "" as number | "",
    status: initialStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskData.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (!taskData.due_date) {
      toast.error("La date d'échéance est requise");
      return;
    }

    router.post(
      route("kanban.store"),
      {
        ...taskData,
        patient_id: taskData.patient_id || null,
        status: initialStatus,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Tâche créée avec succès");
          currentSetOpen(false);
          setTaskData({
            title: "",
            description: "",
            due_date: "",
            priority: "medium",
            patient_id: "",
            status: initialStatus,
          });
          onTaskCreated();
        },
        onError: () => toast.error("Échec de la création de la tâche"),
      }
    );
  };

  return (
    <NativeDialog open={currentOpen} onOpenChange={currentSetOpen}>
      {!isControlled && (
        <NativeDialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Ajouter une tâche
          </Button>
        </NativeDialogTrigger>
      )}

      <NativeDialogContent className="max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Ajouter une tâche</NativeDialogTitle>
          <NativeDialogDescription>
            Créez une nouvelle tâche.
          </NativeDialogDescription>
        </NativeDialogHeader>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          {/* Titre */}
          <div>
            <label className="text-sm font-medium mb-1 block">Titre</label>
            <Input
              placeholder="Titre de la tâche"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Textarea
              placeholder="Description de la tâche"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
            />
          </div>

          {/* Date d'échéance & Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Date d'échéance
              </label>
              <Input
                type="date"
                value={taskData.due_date}
                onChange={(e) =>
                  setTaskData({ ...taskData, due_date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Priorité
              </label>
              <Select
                value={taskData.priority}
                onValueChange={(value) =>
                  setTaskData({
                    ...taskData,
                    priority: value as TaskPriority,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Patient optionnel */}
          {patients.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                Assigné à un patient (optionnel)
              </label>
              <Select
                value={taskData.patient_id ? String(taskData.patient_id) : "none"}
                onValueChange={(value) =>
                  setTaskData({
                    ...taskData,
                    patient_id: value === "none" ? "" : Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem
                      key={patient.id}
                      value={String(patient.id)}
                    >
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bouton soumettre */}
          <div className="flex w-full gap-2 pt-4">
            <Button className="w-full" type="submit">
              Ajouter la tâche
            </Button>
          </div>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
}