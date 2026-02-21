/* eslint-disable import/order */
"use client";

import { useForm } from "@inertiajs/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSuccess?: () => void;
}

export const CreateNewsletterModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("newsletters.store"), {
      onSuccess: () => {
        onOpenChange(false);
        reset();
        onSuccess?.();
      },
      preserveScroll: true,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle>Ajouter un abonné</SheetTitle>
          <SheetDescription>Entrez les informations de l’abonné.</SheetDescription>
        </SheetHeader>

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

          <SheetFooter>
            <Button type="submit" disabled={processing} className="w-full mb-2" size='sm'>
              Ajouter l’abonné
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
