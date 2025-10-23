"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn, type Client } from "@/components/admin/clients/columns";
import { DataTable } from "@/components/admin/clients/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: route('admin.clients'),
    },
    {
        title: 'Clients',
        href: '/dashboard',
    },
];

interface ClientsProps {
  clients: Client[];
  commercials: { id: number; name: string }[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

export default function Clients({ clients, commercials, auth }: ClientsProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // CREATE FORM
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
    phone: "",
    password: "",
    password_confirmation: "",
    commercial_id: "",
  });

  // UPDATE FORM
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
    phone: "",
    password: "",
    password_confirmation: "",
    commercial_id: "",
  });

  // Toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  // Toast handler
  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // CREATE
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.clients.store"), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreateForm();
        showToastMessage("Client added successfully!", "success");
      },
      onError: () => showToastMessage("Failed to add client.", "error"),
    });
  };

  // UPDATE
  const handleUpdate = (client: Client) => {
    setCurrentClient(client);
    setUpdateFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      password: "",
      password_confirmation: "",
      commercial_id: client.commercial?.id ? String(client.commercial.id) : "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    put(route("admin.clients.update", currentClient.id), {
      onSuccess: () => {
        setIsUpdateModalOpen(false);
        resetUpdateForm();
        showToastMessage("Client updated successfully!", "success");
      },
      onError: () => showToastMessage("Failed to update client.", "error"),
    });
  };

  // DELETE
  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!clientToDelete) return;
    router.delete(route("admin.clients.destroy", clientToDelete.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToastMessage("Client deleted successfully!", "success");
      },
      onError: () => showToastMessage("Failed to delete client.", "error"),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Clients" />

      {/* ✅ Toast */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg text-white animate-in fade-in slide-in-from-top-5 ${
            toastType === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* ✅ Main Table */}
      <div className="p-8">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
    <h1 className="text-2xl font-bold">Clients List</h1>
    <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 sm:w-auto w-full">
      <Plus size={16} /> Add Client
    </Button>
  </div>

  <DataTable
    columns={columnsFn(handleUpdate, handleDelete)}
    data={clients}
    rowSelection={rowSelection}
    setRowSelection={setRowSelection}
  />
</div>


      {/* ✅ CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* --- NAME --- */}
            <div>
              <Label>Name</Label>
              <Input value={createFormData.name} onChange={(e) => setCreateFormData("name", e.target.value)} />
              {createErrors.name && <p className="text-red-500 text-sm">{createErrors.name}</p>}
            </div>

            {/* --- EMAIL --- */}
            <div>
              <Label>Email</Label>
              <Input type="email" value={createFormData.email} onChange={(e) => setCreateFormData("email", e.target.value)} />
              {createErrors.email && <p className="text-red-500 text-sm">{createErrors.email}</p>}
            </div>

            {/* --- PHONE --- */}
            <div>
              <Label>Phone</Label>
              <Input value={createFormData.phone} onChange={(e) => setCreateFormData("phone", e.target.value)} />
              {createErrors.phone && <p className="text-red-500 text-sm">{createErrors.phone}</p>}
            </div>

            {/* --- COMMERCIAL --- */}
            <div>
              <Label>Commercial</Label>
              <Select
                value={createFormData.commercial_id}
                onValueChange={(value) => setCreateFormData("commercial_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Commercial" />
                </SelectTrigger>
                <SelectContent>
                  {commercials.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createErrors.commercial_id && <p className="text-red-500 text-sm">{createErrors.commercial_id}</p>}
            </div>

            {/* --- PASSWORD --- */}
            <div className="relative">
              <Label>Password</Label>
              <Input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData("password", e.target.value)}
                className="pr-10"
              />
              {createErrors.password && <p className="text-red-500 text-sm">{createErrors.password}</p>}
            </div>

            {/* --- PASSWORD CONFIRMATION --- */}
            <div className="relative">
              <Label>Confirm Password</Label>
              <Input
                type= "password"
                value={createFormData.password_confirmation}
                onChange={(e) => setCreateFormData("password_confirmation", e.target.value)}
                className="pr-10"
              />
              {createErrors.password_confirmation && (
                <p className="text-red-500 text-sm">{createErrors.password_confirmation}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createProcessing}>
                {createProcessing ? "Saving..." : "Save Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ UPDATE MODAL */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={updateFormData.name} onChange={(e) => setUpdateFormData("name", e.target.value)} />
              {updateErrors.name && <p className="text-red-500 text-sm">{updateErrors.name}</p>}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={updateFormData.email}
                onChange={(e) => setUpdateFormData("email", e.target.value)}
              />
              {updateErrors.email && <p className="text-red-500 text-sm">{updateErrors.email}</p>}
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={updateFormData.phone} onChange={(e) => setUpdateFormData("phone", e.target.value)} />
              {updateErrors.phone && <p className="text-red-500 text-sm">{updateErrors.phone}</p>}
            </div>

            <div>
              <Label>Commercial</Label>
              <Select
                value={updateFormData.commercial_id}
                onValueChange={(value) => setUpdateFormData("commercial_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Commercial" />
                </SelectTrigger>
                <SelectContent>
                  {commercials.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateErrors.commercial_id && <p className="text-red-500 text-sm">{updateErrors.commercial_id}</p>}
            </div>

            <div className="relative">
              <Label>Password</Label>
              <Input
                type= "password"
                value={updateFormData.password}
                onChange={(e) => setUpdateFormData("password", e.target.value)}
                className="pr-10"
              />
              {updateErrors.password && <p className="text-red-500 text-sm">{updateErrors.password}</p>}
            </div>

            <div className="relative">
              <Label>Confirm Password</Label>
              <Input
                type= "password"
                value={updateFormData.password_confirmation}
                onChange={(e) => setUpdateFormData("password_confirmation", e.target.value)}
                className="pr-10"
              />
              {updateErrors.password_confirmation && (
                <p className="text-red-500 text-sm">{updateErrors.password_confirmation}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateProcessing}>
                {updateProcessing ? "Updating..." : "Update Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ DELETE CONFIRM MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-center">
            Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
          </p>
          <DialogFooter className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
