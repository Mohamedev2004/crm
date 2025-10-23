"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn, type Commercial } from "@/components/admin/commercials/columns";
import { DataTable } from "@/components/admin/commercials/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Commercials", href: "/commercials" },
];

interface CommercialsProps {
  commercials: Commercial[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

export default function Commercials({ commercials, auth }: CommercialsProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentCommercial, setCurrentCommercial] = useState<Commercial | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commercialToDelete, setCommercialToDelete] = useState<Commercial | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Create Form
  const {
    data: createFormData,
    setData: setCreateFormData,
    post,
    processing: createProcessing,
    errors: createErrors,
    reset: resetCreateForm,
  } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Update Form
  const {
    data: updateFormData,
    setData: setUpdateFormData,
    put,
    processing: updateProcessing,
    errors: updateErrors,
    reset: resetUpdateForm,
  } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.commercials.store"), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreateForm();
        showToastMessage("Commercial added successfully!", "success");
      },
      onError: () => showToastMessage("Failed to add commercial.", "error"),
    });
  };

  const handleUpdate = (commercial: Commercial) => {
    setCurrentCommercial(commercial);
    setUpdateFormData({
      name: commercial.name,
      email: commercial.email,
      password: "",
      password_confirmation: "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommercial) return;
    put(route("admin.commercials.update", currentCommercial.id), {
      onSuccess: () => {
        setIsUpdateModalOpen(false);
        resetUpdateForm();
        showToastMessage("Commercial updated successfully!", "success");
      },
      onError: () => showToastMessage("Failed to update commercial.", "error"),
    });
  };

  const handleDelete = (commercial: Commercial) => {
    setCommercialToDelete(commercial);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!commercialToDelete) return;
    post(route("admin.commercials.destroy", commercialToDelete.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToastMessage("Commercial deleted successfully!", "success");
      },
      onError: () => showToastMessage("Failed to delete commercial.", "error"),
    });
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Commercials" />

      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg text-white animate-in fade-in slide-in-from-top-5 ${
            toastType === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <div className="p-8">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
    <h1 className="text-2xl font-bold">Commercials List</h1>
    <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 sm:w-auto w-full">
      <Plus size={16} /> Add Commercial
    </Button>
  </div>

  <DataTable
    columns={columnsFn(handleUpdate, handleDelete)}
    data={commercials}
    rowSelection={rowSelection}
    setRowSelection={setRowSelection}
  />
</div>


      {/* Create Commercial Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Commercial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={createFormData.name}
                onChange={e => setCreateFormData("name", e.target.value)}
              />
              {createErrors.name && <p className="text-red-500 text-sm">{createErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createFormData.email}
                onChange={e => setCreateFormData("email", e.target.value)}
              />
              {createErrors.email && <p className="text-red-500 text-sm">{createErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData("password", e.target.value)}
              />
              {createErrors.password && <p className="text-red-500 text-sm">{createErrors.password}</p>}
            </div>

            {/* Password Confirmation */}
            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={createFormData.password_confirmation}
                onChange={(e) => setCreateFormData("password_confirmation", e.target.value)}
              />
              {createErrors.password_confirmation && (
                <p className="text-red-500 text-sm">{createErrors.password_confirmation}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createProcessing}>Save Commercial</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Commercial Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Commercial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="update_name">Name</Label>
              <Input
                id="update_name"
                value={updateFormData.name}
                onChange={e => setUpdateFormData("name", e.target.value)}
              />
              {updateErrors.name && <p className="text-red-500 text-sm">{updateErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="update_email">Email</Label>
              <Input
                id="update_email"
                type="email"
                value={updateFormData.email}
                onChange={e => setUpdateFormData("email", e.target.value)}
              />
              {updateErrors.email && <p className="text-red-500 text-sm">{updateErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="update_password">Password</Label>
              <Input
                id="update_password"
                type="password"
                value={updateFormData.password}
                onChange={e => setUpdateFormData("password", e.target.value)}
              />
              {updateErrors.password && <p className="text-red-500 text-sm">{updateErrors.password}</p>}
            </div>

            {/* Password Confirmation */}
            <div>
              <Label htmlFor="update_password_confirmation">Confirm Password</Label>
              <Input
                id="update_password_confirmation"
                type="password"
                value={updateFormData.password_confirmation}
                onChange={e => setUpdateFormData("password_confirmation", e.target.value)}
              />
              {updateErrors.password_confirmation && (
                <p className="text-red-500 text-sm">{updateErrors.password_confirmation}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateProcessing}>Update Commercial</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-center">
            Are you sure you want to delete <strong>{commercialToDelete?.name}</strong>?
          </p>
          <DialogFooter className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
