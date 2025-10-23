"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn, type Invoice } from "@/components/admin/invoices/columns";
import { DataTable } from "@/components/admin/invoices/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Invoices", href: "/invoices" },
];

interface InvoicesProps {
  invoices: Invoice[];
  auth: {
    user: {
      role: "admin" | "client";
      name: string;
    };
  };
}

export default function Invoices({ invoices, auth }: InvoicesProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Create form
  const {
    data: createFormData,
    setData: setCreateFormData,
    post,
    processing: createProcessing,
    errors: createErrors,
    reset: resetCreateForm,
  } = useForm({
    title: "",
    description: "",
    amount: "",
    tax: "",
    discount: "",
    status: "pending",
    due_date: "",
    currency: "USD",
    client_name: "",
    client_email: "",
  });

  // Update form
  const {
    data: updateFormData,
    setData: setUpdateFormData,
    put,
    processing: updateProcessing,
    errors: updateErrors,
    reset: resetUpdateForm,
  } = useForm({
    title: "",
    description: "",
    amount: "",
    tax: "",
    discount: "",
    status: "pending",
    due_date: "",
    currency: "USD",
    client_name: "",
    client_email: "",
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
    post(route("admin.invoices.store"), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreateForm();
        showToastMessage("Invoice created successfully!", "success");
      },
      onError: () => showToastMessage("Failed to create invoice.", "error"),
    });
  };

  const handleUpdate = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setUpdateFormData({
      title: invoice.title,
      description: invoice.description || "",
      amount: invoice.amount.toString(),
      tax: invoice.tax?.toString() || "0",
      discount: invoice.discount?.toString() || "0",
      status: invoice.status,
      due_date: invoice.due_date || "",
      currency: invoice.currency,
      client_name: invoice.client_name || "",
      client_email: invoice.client_email || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) return;
    put(route("admin.invoices.update", currentInvoice.id), {
      onSuccess: () => {
        setIsUpdateModalOpen(false);
        resetUpdateForm();
        showToastMessage("Invoice updated successfully!", "success");
      },
      onError: () => showToastMessage("Failed to update invoice.", "error"),
    });
  };

  const handleDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
  if (!invoiceToDelete) return;

  router.delete(route("admin.invoices.destroy", invoiceToDelete.id), {
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      showToastMessage("Invoice deleted successfully!", "success");
    },
    onError: () => showToastMessage("Failed to delete invoice.", "error"),
  });
};

  const handleDownload = (invoice: Invoice) => {
    if (!invoice.file_path) {
        showToastMessage("No file available to download", "error");
        return;
    }
    window.open(`/storage/${invoice.file_path}`, "_blank");
  };

  const handleSetPaid = (invoice: Invoice) => {
    router.post(route("admin.invoices.setPaid", invoice.id), {}, {
      onSuccess: () => showToastMessage("Invoice marked as Paid!", "success"),
      onError: () => showToastMessage("Failed to mark invoice as Paid.", "error"),
    });
  };

  const handleSetOverdue = (invoice: Invoice) => {
    router.post(route("admin.invoices.setOverdue", invoice.id), {}, {
      onSuccess: () => showToastMessage("Invoice marked as Overdue!", "success"),
      onError: () => showToastMessage("Failed to mark invoice as Overdue.", "error"),
    });
  };


  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Invoices" />

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
          <h1 className="text-2xl font-bold">Invoices List</h1>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 sm:w-auto w-full">
            <Plus size={16} /> Add Invoice
          </Button>
        </div>

        <DataTable
          columns={columnsFn(handleUpdate, handleDelete, handleDownload, handleSetPaid, handleSetOverdue)}
          data={invoices}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={createFormData.title} onChange={e => setCreateFormData("title", e.target.value)} />
              {createErrors.title && <p className="text-red-500 text-sm">{createErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={createFormData.description} onChange={e => setCreateFormData("description", e.target.value)} />
              {createErrors.description && <p className="text-red-500 text-sm">{createErrors.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input type="number" id="amount" value={createFormData.amount} onChange={e => setCreateFormData("amount", e.target.value)} />
                {createErrors.amount && <p className="text-red-500 text-sm">{createErrors.amount}</p>}
              </div>
              <div>
                <Label htmlFor="tax">Tax</Label>
                <Input type="number" id="tax" value={createFormData.tax} onChange={e => setCreateFormData("tax", e.target.value)} />
                {createErrors.tax && <p className="text-red-500 text-sm">{createErrors.tax}</p>}
              </div>
              <div>
                <Label htmlFor="discount">Discount</Label>
                <Input type="number" id="discount" value={createFormData.discount} onChange={e => setCreateFormData("discount", e.target.value)} />
                {createErrors.discount && <p className="text-red-500 text-sm">{createErrors.discount}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input id="client_name" value={createFormData.client_name} onChange={e => setCreateFormData("client_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="client_email">Client Email</Label>
              <Input type="email" id="client_email" value={createFormData.client_email} onChange={e => setCreateFormData("client_email", e.target.value)} />
              {createErrors.client_email && <p className="text-red-500 text-sm">{createErrors.client_email}</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createProcessing}>Save Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Invoice Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="update_title">Title</Label>
              <Input id="update_title" value={updateFormData.title} onChange={e => setUpdateFormData("title", e.target.value)} />
              {updateErrors.title && <p className="text-red-500 text-sm">{updateErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="update_description">Description</Label>
              <Input id="update_description" value={updateFormData.description} onChange={e => setUpdateFormData("description", e.target.value)} />
              {updateErrors.description && <p className="text-red-500 text-sm">{updateErrors.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="update_amount">Amount</Label>
                <Input type="number" id="update_amount" value={updateFormData.amount} onChange={e => setUpdateFormData("amount", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="update_tax">Tax</Label>
                <Input type="number" id="update_tax" value={updateFormData.tax} onChange={e => setUpdateFormData("tax", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="update_discount">Discount</Label>
                <Input type="number" id="update_discount" value={updateFormData.discount} onChange={e => setUpdateFormData("discount", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="update_client_name">Client Name</Label>
              <Input id="update_client_name" value={updateFormData.client_name} onChange={e => setUpdateFormData("client_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="update_client_email">Client Email</Label>
              <Input type="email" id="update_client_email" value={updateFormData.client_email} onChange={e => setUpdateFormData("client_email", e.target.value)} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateProcessing}>Update Invoice</Button>
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
            Are you sure you want to delete <strong>{invoiceToDelete?.title}</strong>?
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
