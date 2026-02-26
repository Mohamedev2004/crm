/* eslint-disable import/order */
"use client";

import { useForm } from "@inertiajs/react";
import {
  NativeDialog,
  NativeDialogContent,
  NativeDialogHeader,
  NativeDialogTitle,
  NativeDialogDescription,
  NativeDialogFooter,
} from "@/components/native-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Newsletter {
  id: number;
  email: string;
}

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  selectedSubscriber: Newsletter | null;
  onSuccess?: () => void;
}

export const UpdateNewsletterModal = ({ open, onOpenChange, selectedSubscriber, onSuccess }: Props) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    _method: "PUT" as const,
  });

  // Remplir le formulaire lorsqu’un abonné est sélectionné
  useEffect(() => {
    if (selectedSubscriber) {
      setData({
        email: selectedSubscriber.email,
        _method: "PUT",
      });
    }
  }, [selectedSubscriber, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubscriber) return;

    post(route("newsletters.update", selectedSubscriber.id), {
      onSuccess: () => {
        onOpenChange(false);
        reset();
        onSuccess?.();
      },
      preserveScroll: true,
    });
  };

  return (
    <NativeDialog open={open} onOpenChange={onOpenChange}>
      <NativeDialogContent className="max-w-md">
        <NativeDialogHeader>
          <NativeDialogTitle>Modifier l’abonné</NativeDialogTitle>
          <NativeDialogDescription>Mettre à jour les informations de l’abonné.</NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 mx-4">
            <div className="flex flex-col">
              <Label className="mb-2">Email</Label>
              <Input
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                placeholder="email@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <NativeDialogFooter>
            <Button type="submit" disabled={processing} className="w-full mt-2" size="sm">
              Mettre à jour l’abonné
            </Button>
          </NativeDialogFooter>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
};
