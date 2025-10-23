/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn } from "@/components/admin/leads/columns";
import { DataTable } from "@/components/admin/leads/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
// Import 'Inertia' for global requests like status updates
import { Head, useForm, router as Inertia, router } from "@inertiajs/react"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Leads", href: "/leads" }];

export interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  service: string;
  source: "social" | "call" | "email" | "others";
  content?: string | null;
  status?: string | null;
  client?: { id: number; name: string } | null;
  createdBy?: { id: number; name: string } | null;
  created_at: string;
  deleted_at?: string | null;
}

interface LeadsProps {
  leads?: Lead[];
  clients?: { id: number; name: string }[];
  statuses?: string[];
  creators?: { id: number; name: string }[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

export default function Leads({
  leads = [],
  clients = [],
  statuses = [],
  creators = [],
  auth,
}: LeadsProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateStep, setUpdateStep] = useState(1);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // === Deal modal ===
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [qualifiedLead, setQualifiedLead] = useState<Lead | null>(null);

  // === Toast ===
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // === Lead create form ===
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
    service: "",
    source: "social" as "social" | "call" | "email" | "others",
    content: "",
    status: "",
    client_id: "",
  });

  // === Lead update form ===
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
    service: "",
    source: "social" as "social" | "call" | "email" | "others",
    content: "",
    client_id: "",
  });

  // === Deal form ===
  const {
    data: dealFormData,
    setData: setDealFormData,
    patch: patchDeal,
    processing: dealProcessing,
    errors: dealErrors,
    reset: resetDealForm,
  } = useForm({
    value: "",
  });

  // === Toast auto-hide ===
  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // === CREATE LEAD ===
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.leads.store"), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setCreateStep(1);
        resetCreateForm();
        showToastMessage("Lead added successfully!", "success");
      },
      onError: () => showToastMessage("Failed to add lead.", "error"),
    });
  };

  // === UPDATE LEAD ===
  const handleUpdate = (lead: Lead) => {
    setCurrentLead(lead);
    setUpdateFormData({
      name: lead.name,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      service: lead.service,
      source: lead.source,
      content: lead.content ?? "",
      client_id: lead.client?.id ? String(lead.client.id) : "",
    });
    setUpdateStep(1);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentLead) return;

    put(route("admin.leads.update", currentLead.id), {
      ...updateFormData,
      preserveScroll: true,
      onSuccess: () => {
        setIsUpdateModalOpen(false);
        setUpdateStep(1);
        resetUpdateForm();
        showToastMessage("Lead updated successfully!", "success");
      },
      onError: () => showToastMessage("Failed to update lead.", "error"),
    });
  };

  // === DELETE LEAD ===
  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!leadToDelete) return;
    router.delete(route("admin.leads.destroy", leadToDelete.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToastMessage("Lead deleted successfully!", "success");
      },
      onError: () => showToastMessage("Failed to delete lead.", "error"),
    });
  };

  // === STATUS UPDATE + DEAL MODAL (Uses Inertia.patch) ===
  const handleSetStatus = (lead: Lead, status: string) => {
    const routeMap: Record<string, string> = {
      new: "admin.leads.setNew",
      contacted: "admin.leads.setContacted",
      qualified: "admin.leads.setQualified",
      converted: "admin.leads.setConverted",
      lost: "admin.leads.setLost",
    };

    const routeName = routeMap[status];
    if (!routeName) return;

    if (status === "qualified") {
      setQualifiedLead(lead);
      resetDealForm(); 
      setIsDealModalOpen(true);
      return;
    }

    // FIX: Use Inertia.patch for simple, non-form status updates
    Inertia.patch(route(routeName, lead.id), undefined, { 
      onSuccess: () =>
        showToastMessage(
          `Lead status set to ${status.charAt(0).toUpperCase() + status.slice(1)}!`,
          "success"
        ),
      onError: () => showToastMessage("Failed to update status.", "error"),
    });
  };

  // === SUBMIT DEAL VALUE (Uses useForm.patch) ===
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualifiedLead) return;

    // FIX: Pass the form data directly. `patchDeal` automatically sends `dealFormData`.
    patchDeal(route("admin.leads.setQualified", qualifiedLead.id), {
      // NOTE: `dealFormData.value` is sent automatically. No need for a `data` wrapper.
      preserveScroll: true,
      onSuccess: () => {
        setIsDealModalOpen(false);
        setQualifiedLead(null);
        resetDealForm();
        showToastMessage("Lead qualified and deal created!", "success");
      },
      onError: (errors) => {
        console.error("Deal creation failed:", errors);
        showToastMessage("Failed to create deal. Check form fields and console.", "error");
      },
    });
  };

  const createdByOptions = leads
    .map((lead) => lead.createdBy)
    .filter((c): c is { id: number; name: string } => !!c)
    .reduce((acc, c) => {
      if (!acc.find((x) => x.id === c.id)) acc.push(c);
      return acc;
    }, [...(creators ?? [])]);

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Leads" />

      {/* Toast */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Leads List</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 sm:w-auto w-full sm:mt-0 mt-4"
          >
            <Plus size={16} /> Add Lead
          </Button>
        </div>

        <DataTable
          columns={columnsFn(handleUpdate, handleDelete, handleSetStatus)}
          data={leads ?? []}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          statusFilterOptions={statuses.map((s) => ({ id: s, name: s }))}
          clientFilterOptions={clients}
          createdByFilterOptions={createdByOptions}
        />
      </div>

      {/* ========== DEAL MODAL ========== */}
      <Dialog open={isDealModalOpen} onOpenChange={setIsDealModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>
              Qualify Lead: {qualifiedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div>
              <Label>Deal Value</Label>
              <Input
                type="number"
                step="0.01"
                value={dealFormData.value}
                onChange={(e) => setDealFormData("value", e.target.value)}
                placeholder="Enter deal value"
                required
              />
              {/* Show validation error for value */}
              {dealErrors.value && <p className="text-red-500 text-sm">{dealErrors.value}</p>}
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDealModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={dealProcessing}>
                {dealProcessing ? "Saving..." : "Confirm Qualification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= CREATE MODAL ================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={createFormData.name} onChange={(e) => setCreateFormData("name", e.target.value)} />
                  {createErrors.name && <p className="text-red-500 text-sm">{createErrors.name}</p>}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value={createFormData.email} onChange={(e) => setCreateFormData("email", e.target.value)} />
                  {createErrors.email && <p className="text-red-500 text-sm">{createErrors.email}</p>}
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={createFormData.phone} onChange={(e) => setCreateFormData("phone", e.target.value)} />
                  {createErrors.phone && <p className="text-red-500 text-sm">{createErrors.phone}</p>}
                </div>

                <div>
                  <Label>Service</Label>
                  <Input value={createFormData.service} onChange={(e) => setCreateFormData("service", e.target.value)} />
                  {createErrors.service && <p className="text-red-500 text-sm">{createErrors.service}</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => setCreateStep(2)}>Next</Button>
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Source</Label>
                  <Select value={createFormData.source} onValueChange={(value) => setCreateFormData("source", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {["social", "call", "email", "others"].map((source) => (
                        <SelectItem key={source} value={source} className="capitalize">{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Client</Label>
                  <Select value={createFormData.client_id} onValueChange={(value) => setCreateFormData("client_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={createFormData.status} onValueChange={(value) => setCreateFormData("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateStep(1)}>Back</Button>
                  <Button type="submit" disabled={createProcessing}>{createProcessing ? "Saving..." : "Save Lead"}</Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= UPDATE MODAL ================= */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {updateStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={updateFormData.name} onChange={(e) => setUpdateFormData("name", e.target.value)} />
                  {updateErrors.name && <p className="text-red-500 text-sm">{updateErrors.name}</p>}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value={updateFormData.email} onChange={(e) => setUpdateFormData("email", e.target.value)} />
                  {updateErrors.email && <p className="text-red-500 text-sm">{updateErrors.email}</p>}
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={updateFormData.phone} onChange={(e) => setUpdateFormData("phone", e.target.value)} />
                  {updateErrors.phone && <p className="text-red-500 text-sm">{updateErrors.phone}</p>}
                </div>

                <div>
                  <Label>Service</Label>
                  <Input value={updateFormData.service} onChange={(e) => setUpdateFormData("service", e.target.value)} />
                  {updateErrors.service && <p className="text-red-500 text-sm">{updateErrors.service}</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => setUpdateStep(2)}>Next</Button>
                </div>
              </div>
            )}

            {updateStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Source</Label>
                  <Select value={updateFormData.source} onValueChange={(value) => setUpdateFormData("source", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {["social", "call", "email", "others"].map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Client</Label>
                  <Select value={updateFormData.client_id} onValueChange={(value) => setUpdateFormData("client_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between gap-2">
                  <Button type="button" variant="outline" onClick={() => setUpdateStep(1)}>Back</Button>
                  <Button type="submit" disabled={updateProcessing}>{updateProcessing ? "Updating..." : "Update Lead"}</Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE MODAL ================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}