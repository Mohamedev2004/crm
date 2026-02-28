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

export function CreateContactModal({ open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    router.post(
      route("contacts.store"),
      form,
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Contact ajouté");
          onOpenChange(false);
          onSuccess?.();
          setForm({ name: "", phone: "", email: "", subject: "", message: "" });
        },
        onError: () => toast.error("Échec de l'ajout du contact"),
      }
    );
  };

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Ajouter un contact</NativeDialogTitle>
          <NativeDialogDescription>Créez un nouveau contact.</NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={submit} className="space-y-2 mt-6">
          <div>
            <Label>Nom </Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Sujet</Label>
            <Input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
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

