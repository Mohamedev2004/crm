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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

import type { Patient } from "@/types/patient";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  selectedPatient: Patient | null;
  onSuccess?: () => void;
}

export const UpdatePatientMedicalModal = ({
  open,
  onOpenChange,
  selectedPatient,
  onSuccess,
}: Props) => {
  const { data, setData, put, processing, errors, reset } = useForm({
    blood_group: "",
    allergies: "",
    chronic_diseases: "",
    current_medications: "",
    is_pregnant: false,
    notes: "",
    _method: "PUT" as const,
  });

  // Fill form when patient selected
  useEffect(() => {
    if (selectedPatient) {
      setData({
        blood_group: selectedPatient.blood_group || "",
        allergies: selectedPatient.allergies || "",
        chronic_diseases: selectedPatient.chronic_diseases || "",
        is_pregnant: !!selectedPatient.is_pregnant,
        notes: selectedPatient.notes || "",
        _method: "PUT",
      });
    }
  }, [selectedPatient, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    put(route("patients.updateMedicalInfos", selectedPatient.id), {
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
          <NativeDialogTitle>Modifier les infos médicales</NativeDialogTitle>
          <NativeDialogDescription>
            Mettez à jour les informations médicales du patient.
          </NativeDialogDescription>
        </NativeDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mx-4">

            {/* Blood Group */}
            <div className="flex flex-col">
              <Label className="mb-2">Groupe sanguin</Label>

              <Select
                value={data.blood_group}
                onValueChange={(value) => setData("blood_group", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un groupe sanguin" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>

              {errors.blood_group && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.blood_group}
                </p>
              )}
            </div>


            {/* Pregnancy */}
            <div className="flex flex-col">
              <Label className="mb-2">Patiente enceinte</Label>

              <Select
                value={data.is_pregnant ? "true" : "false"}
                onValueChange={(value) =>
                  setData("is_pregnant", value === "true")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une option" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="true">Oui</SelectItem>
                  <SelectItem value="false">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allergies */}
            <div className="flex flex-col col-span-2">
              <Label className="mb-2">Allergies</Label>
              <Textarea
                value={data.allergies}
                onChange={(e) => setData("allergies", e.target.value)}
                placeholder="Décrire les allergies..."
              />
              {errors.allergies && (
                <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>
              )}
            </div>

            {/* Chronic Diseases */}
            <div className="flex flex-col col-span-2">
              <Label className="mb-2">Maladies chroniques</Label>
              <Textarea
                value={data.chronic_diseases}
                onChange={(e) =>
                  setData("chronic_diseases", e.target.value)
                }
                placeholder="Diabète, Hypertension..."
              />
              {errors.chronic_diseases && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.chronic_diseases}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="flex flex-col col-span-2">
              <Label className="mb-2">Notes médicales</Label>
              <Textarea
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                placeholder="Observations supplémentaires..."
              />
              {errors.notes && (
                <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
              )}
            </div>

          </div>

          <NativeDialogFooter>
            <Button
              type="submit"
              disabled={processing}
              className="w-full mt-2"
              size="sm"
            >
              Mettre à jour
            </Button>
          </NativeDialogFooter>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
};