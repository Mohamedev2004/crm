/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSuccess?: () => void;
}

export const CreatePatientModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const [step, setStep] = useState(1);
  const [patientId, setPatientId] = useState<number | null>(null);

  // Step 1 form
  const step1Form = useForm({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    cin: "",
  });

  // Step 2 form
  const step2Form = useForm({
    blood_group: "",
    allergies: "",
    chronic_diseases: "",
    notes: "",
    is_pregnant: false,
  });

  // Step 1 submit using Axios
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(route("patients.storeBasicInfos"), step1Form.data);

      const patientId = response.data.patient?.id;
      if (patientId) {
        setPatientId(patientId);
        setStep(2); // go to step 2
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        step1Form.setError(err.response.data.errors);
      }
    }
  };

  // Step 2 submit using Axios
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    try {
      await axios.post(route("patients.storeMedicalInfos", patientId), step2Form.data);

      // Reset everything after success
      step1Form.reset();
      step2Form.reset();
      setStep(1);
      setPatientId(null);
      onOpenChange(false);
      onSuccess?.();
      toast.success("Patient ajouté avec succès !");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        step2Form.setError(err.response.data.errors);
      }
    }
  };

  return (
    <NativeDialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setStep(1);
          setPatientId(null);
          step1Form.reset();
          step2Form.reset();
        }
      }}
    >
      <NativeDialogContent>
        <NativeDialogHeader>
          <NativeDialogTitle>Ajouter un patient</NativeDialogTitle>
          <NativeDialogDescription>
            {step === 1
              ? "Entrez les informations de base du patient."
              : "Entrez les informations médicales du patient."}
          </NativeDialogDescription>
        </NativeDialogHeader>

        <form
          onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit}
          className="space-y-4"
        >
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label className="mb-2">Prénom</Label>
                <Input
                  value={step1Form.data.first_name}
                  onChange={(e) => step1Form.setData("first_name", e.target.value)}
                />
                {step1Form.errors.first_name && (
                  <p className="text-red-500 text-sm">{step1Form.errors.first_name}</p>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="mb-2">Nom</Label>
                <Input
                  value={step1Form.data.last_name}
                  onChange={(e) => step1Form.setData("last_name", e.target.value)}
                />
                {step1Form.errors.last_name && (
                  <p className="text-red-500 text-sm">{step1Form.errors.last_name}</p>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="mb-2">Téléphone</Label>
                <Input
                  value={step1Form.data.phone}
                  onChange={(e) => step1Form.setData("phone", e.target.value)}
                />
                {step1Form.errors.phone && (
                  <p className="text-red-500 text-sm">{step1Form.errors.phone}</p>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="mb-2">Adresse</Label>
                <Input
                  value={step1Form.data.address}
                  onChange={(e) => step1Form.setData("address", e.target.value)}
                />
                {step1Form.errors.address && (
                  <p className="text-red-500 text-sm">{step1Form.errors.address}</p>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="mb-2">Date de naissance</Label>
                <Input
                  type="date"
                  value={step1Form.data.date_of_birth}
                  onChange={(e) => step1Form.setData("date_of_birth", e.target.value)}
                />
                {step1Form.errors.date_of_birth && (
                  <p className="text-red-500 text-sm">{step1Form.errors.date_of_birth}</p>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="mb-2">CIN</Label>
                <Input
                  value={step1Form.data.cin}
                  onChange={(e) => step1Form.setData("cin", e.target.value)}
                />
                {step1Form.errors.cin && (
                  <p className="text-red-500 text-sm">{step1Form.errors.cin}</p>
                )}
              </div>

              <div className="flex flex-col col-span-2">
                <Label className="mb-2">Email</Label>
                <Input
                  type="email"
                  value={step1Form.data.email}
                  onChange={(e) => step1Form.setData("email", e.target.value)}
                />
                {step1Form.errors.email && (
                  <p className="text-red-500 text-sm">{step1Form.errors.email}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4">
            {/* Blood Group */}
            <div className="flex flex-col">
                <Label className="mb-2">Groupe sanguin</Label>
                <Select
                value={step2Form.data.blood_group}
                onValueChange={(val) => step2Form.setData("blood_group", val)}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un groupe sanguin" />
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
            </div>

            {/* Allergies */}
            <div className="flex flex-col">
                <Label className="mb-2">Allergies</Label>
                <Textarea
                value={step2Form.data.allergies}
                onChange={(e) => step2Form.setData("allergies", e.target.value)}
                rows={3}
                />
            </div>

            {/* Chronic Diseases */}
            <div className="flex flex-col">
                <Label className="mb-2">Maladies chroniques</Label>
                <Textarea
                value={step2Form.data.chronic_diseases}
                onChange={(e) => step2Form.setData("chronic_diseases", e.target.value)}
                rows={3}
                />
            </div>

            {/* Notes */}
            <div className="flex flex-col">
                <Label className="mb-2">Notes</Label>
                <Textarea
                value={step2Form.data.notes}
                onChange={(e) => step2Form.setData("notes", e.target.value)}
                rows={3}
                />
            </div>

            {/* Pregnant Checkbox */}
            <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                checked={step2Form.data.is_pregnant}
                onCheckedChange={(val) => step2Form.setData("is_pregnant", !!val)}
                />
                <Label className="mb-2">Enceinte</Label>
            </div>
            </div>
          )}

          <NativeDialogFooter className="flex justify-between">
            {step === 2 && (
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Retour
              </Button>
            )}
            <Button
              type="submit"
              disabled={step === 1 ? step1Form.processing : step2Form.processing}
            >
              {step === 1 ? "Suivant" : "Ajouter le patient"}
            </Button>
          </NativeDialogFooter>
        </form>
      </NativeDialogContent>
    </NativeDialog>
  );
};