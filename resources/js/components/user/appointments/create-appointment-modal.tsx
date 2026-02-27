/* eslint-disable import/order */
"use client";

import { useState } from "react";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogDescription,
  NativeDialogHeader,
  NativeDialogTitle,
} from "@/components/native-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAppointmentModal({ open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    appointment_date: "",
    note: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim() || !form.appointment_date) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    router.post(
      route("appointments.store"),
      form,
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Rendez-vous ajouté");
          onOpenChange(false);
          onSuccess?.();
          setForm({ full_name: "", phone: "", email: "", appointment_date: "", note: "" });
        },
        onError: () => toast.error("Échec de l'ajout du rendez-vous"),
      }
    );
  };

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Ajouter un rendez-vous</NativeDialogTitle>
          <NativeDialogDescription>Créez un nouveau rendez-vous.</NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={submit} className="space-y-2 mt-6">
          <div>
            <Label>Nom complet</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
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
              required
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
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
}

