/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable import/order */
"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import type { Appointment } from "@/components/user/appointments/columns";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment: Appointment | null;
  onSuccess?: () => void;
}

export function UpdateAppointmentModal({ open, onOpenChange, appointment, onSuccess }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    appointment_date: "",
    note: "",
  });

  useEffect(() => {
    if (!appointment) return;
    const iso = new Date(appointment.appointment_date.replace(" ", "T"));
    const pad = (n: number) => String(n).padStart(2, "0");
    const value = isNaN(iso.getTime())
      ? ""
      : `${iso.getFullYear()}-${pad(iso.getMonth() + 1)}-${pad(iso.getDate())}T${pad(
          iso.getHours()
        )}:${pad(iso.getMinutes())}`;
    setForm({
      full_name: appointment.full_name,
      phone: appointment.phone,
      email: appointment.email ?? "",
      appointment_date: value,
      note: appointment.note ?? "",
    });
  }, [appointment]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    router.put(
      route("appointments.update", appointment.id),
      { ...form },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Rendez-vous mis à jour");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: () => toast.error("Échec de la mise à jour"),
      }
    );
  };

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Modifier le rendez-vous</NativeDialogTitle>
          <NativeDialogDescription>Mettez à jour les détails du rendez-vous.</NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={submit} className="space-y-2 mt-6">
          <div>
            <Label>Nom complet</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Date et heure</Label>
            <Input
              type="datetime-local"
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
}

