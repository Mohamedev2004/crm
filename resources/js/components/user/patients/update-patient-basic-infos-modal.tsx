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

import type { Patient } from "@/types/patient";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  selectedPatient: Patient | null;
  onSuccess?: () => void;
}

export const UpdatePatientBasicModal = ({
  open,
  onOpenChange,
  selectedPatient,
  onSuccess,
}: Props) => {
  const { data, setData, put, processing, errors, reset } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    phone: "",
    date_of_birth: "",
    cin: "",
    _method: "PUT" as const,
  });

  // Fill the form when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      setData({
        first_name: selectedPatient.first_name || "",
        last_name: selectedPatient.last_name || "",
        email: selectedPatient.email || "",
        phone: selectedPatient.phone || "",
        address: selectedPatient.address || "",
        date_of_birth: selectedPatient.date_of_birth || "",
        cin: selectedPatient.cin || "",
        _method: "PUT",
      });
    }
  }, [selectedPatient, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    put(route("patients.updateBasicInfos", selectedPatient.id), {
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
      <NativeDialogContent>
        <NativeDialogHeader>
          <NativeDialogTitle>Modifier les infos de base</NativeDialogTitle>
          <NativeDialogDescription>
            Mettez à jour les informations de base du patient.
          </NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mx-4">

            {/* First Name */}
            <div className="flex flex-col">
              <Label className="mb-2">Prénom</Label>
              <Input
                value={data.first_name}
                onChange={(e) => setData("first_name", e.target.value)}
                placeholder="Prénom"
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <Label className="mb-2">Nom</Label>
              <Input
                value={data.last_name}
                onChange={(e) => setData("last_name", e.target.value)}
                placeholder="Nom"
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <Label className="mb-2">Téléphone</Label>
              <Input
                value={data.phone}
                onChange={(e) => setData("phone", e.target.value)}
                placeholder="+212 6 12 34 56 78"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col">
              <Label className="mb-2">Date de naissance</Label>
              <Input
                type="date"
                value={data.date_of_birth}
                onChange={(e) => setData("date_of_birth", e.target.value)}
              />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
            </div>

            {/* CIN */}
            <div className="flex flex-col">
              <Label className="mb-2">CIN</Label>
              <Input
                value={data.cin}
                onChange={(e) => setData("cin", e.target.value)}
                placeholder="CIN"
              />
              {errors.cin && <p className="text-red-500 text-sm mt-1">{errors.cin}</p>}
            </div>

            {/* ADDRESS */}
            <div className="flex flex-col">
              <Label className="mb-2">Adresse</Label>
              <Input
                value={data.address}
                onChange={(e) => setData("address", e.target.value)}
                placeholder="Adresse"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Email (full width) */}
            <div className="flex flex-col col-span-2">
              <Label className="mb-2">Email</Label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                placeholder="email@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

          </div>

          <NativeDialogFooter>
            <Button type="submit" disabled={processing} className="w-full mt-2" size="sm">
              Mettre à jour
            </Button>
          </NativeDialogFooter>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
};