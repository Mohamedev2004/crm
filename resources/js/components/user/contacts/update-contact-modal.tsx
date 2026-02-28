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
import type { Contact } from "@/components/user/contacts/columns";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: Contact | null;
  onSuccess?: () => void;
}

export function UpdateContactModal({ open, onOpenChange, contact, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!contact) return;

    setForm({
      name: contact.name ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      subject: contact.subject ?? "",
      message: contact.message ?? "",
    });
  }, [contact]);

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    router.put(
      route("contacts.update", contact.id),
      { ...form },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Contact mis à jour");
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
          <NativeDialogTitle>Modifier le contact</NativeDialogTitle>
          <NativeDialogDescription>Mettez à jour les détails du contact.</NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={submit} className="space-y-2 mt-6">
          <div>
            <Label>Nom </Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
}

