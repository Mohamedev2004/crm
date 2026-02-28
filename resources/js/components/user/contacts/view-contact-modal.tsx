"use client";

import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogHeader,
  NativeDialogTitle,
  NativeDialogDescription,
} from "@/components/native-dialog";
import { Label } from "@/components/ui/label";
import type { Contact } from "@/components/user/contacts/columns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: Contact | null;
}

export function ViewContactModal({ open, onOpenChange, contact }: Props) {
  if (!contact) return null;

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="max-w-lg">
        <NativeDialogHeader>
          <NativeDialogTitle>Détails du contact</NativeDialogTitle>
          <NativeDialogDescription>
            Informations complètes du message reçu.
          </NativeDialogDescription>
        </NativeDialogHeader>

        <div className="space-y-4 mt-6 text-sm">
          <div>
            <Label>Nom</Label>
            <p className="mt-1 font-medium">{contact.name}</p>
          </div>

          <div>
            <Label>Email</Label>
            <p className="mt-1">{contact.email || "-"}</p>
          </div>

          <div>
            <Label>Téléphone</Label>
            <p className="mt-1">{contact.phone || "-"}</p>
          </div>

          <div>
            <Label>Sujet</Label>
            <p className="mt-1">{contact.subject || "-"}</p>
          </div>

          <div>
            <Label>Message</Label>
            <div className="mt-1">
              {contact.message || "-"}
            </div>
          </div>

          <div>
            <Label>Créé le</Label>
            <p className="mt-1">
              {new Date(contact.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </NativeDialogContent>
    </NativeDialog>
  );
}
