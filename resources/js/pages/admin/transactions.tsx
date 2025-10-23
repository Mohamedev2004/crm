"use client";

import { useState, useEffect } from "react";
import { columns as columnsFn, type Transaction } from "@/components/admin/transactions/columns";
import { DataTable } from "@/components/admin/transactions/data-table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Transactions", href: "/transactions" },
];

interface TransactionsProps {
  transactions: Transaction[];
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
}

export default function Transactions({ transactions, auth }: TransactionsProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
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
    type: "income",
    title: "",
    amount: "",
    income_source: "",
    expense_category: "",
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
    type: "",
    title: "",
    amount: "",
    income_source: "",
    expense_category: "",
  });

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

  // CRUD Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.transactions.store"), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreateForm();
        showToastMessage("Transaction added successfully!", "success");
      },
      onError: () => showToastMessage("Failed to add transaction.", "error"),
    });
  };

  const handleUpdate = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setUpdateFormData({
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount.toString(),
      income_source: transaction.income_source || "",
      expense_category: transaction.expense_category || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransaction) return;
    put(route("admin.transactions.update", currentTransaction.id), {
      onSuccess: () => {
        setIsUpdateModalOpen(false);
        resetUpdateForm();
        showToastMessage("Transaction updated successfully!", "success");
      },
      onError: () => showToastMessage("Failed to update transaction.", "error"),
    });
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!transactionToDelete) return;
    router.delete(route("admin.transactions.destroy", transactionToDelete.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToastMessage("Transaction deleted successfully!", "success");
      },
      onError: () => showToastMessage("Failed to delete transaction.", "error"),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Transactions" />

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

      {/* Header + Table */}
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold">Transactions List</h1>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 sm:w-auto w-full">
            <Plus size={16} /> Add Transaction
          </Button>
        </div>

        <DataTable
          columns={columnsFn(handleUpdate, handleDelete)}
          data={transactions}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Create Transaction Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={createFormData.type}
                onValueChange={(value) => setCreateFormData("type", value)}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {createErrors.type && <p className="text-red-500 text-sm">{createErrors.type}</p>}
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData("title", e.target.value)}
              />
              {createErrors.title && <p className="text-red-500 text-sm">{createErrors.title}</p>}
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={createFormData.amount}
                onChange={(e) => setCreateFormData("amount", e.target.value)}
              />
              {createErrors.amount && <p className="text-red-500 text-sm">{createErrors.amount}</p>}
            </div>

            {createFormData.type === "income" && (
              <div>
                <Label htmlFor="income_source">Income Source</Label>
                <Select
                  value={createFormData.income_source}
                  onValueChange={(v) => setCreateFormData("income_source", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {createFormData.type === "expense" && (
              <div>
                <Label htmlFor="expense_category">Expense Category</Label>
                <Select
                  value={createFormData.expense_category}
                  onValueChange={(v) => setCreateFormData("expense_category", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food_drink">Food & Drink</SelectItem>
                    <SelectItem value="grocery">Grocery</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={createProcessing}>Save Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Transaction Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                value={updateFormData.type}
                onValueChange={(value) => setUpdateFormData("type", value)}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {updateErrors.type && <p className="text-red-500 text-sm">{updateErrors.type}</p>}
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={updateFormData.title}
                onChange={(e) => setUpdateFormData("title", e.target.value)}
              />
              {updateErrors.title && <p className="text-red-500 text-sm">{updateErrors.title}</p>}
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={updateFormData.amount}
                onChange={(e) => setUpdateFormData("amount", e.target.value)}
              />
              {updateErrors.amount && <p className="text-red-500 text-sm">{updateErrors.amount}</p>}
            </div>

            {updateFormData.type === "income" && (
              <div>
                <Label>Income Source</Label>
                <Select
                  value={updateFormData.income_source}
                  onValueChange={(v) => setUpdateFormData("income_source", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                {updateErrors.income_source && <p className="text-red-500 text-sm">{updateErrors.income_source}</p>}
              </div>
            )}

            {updateFormData.type === "expense" && (
              <div>
                <Label>Expense Category</Label>
                <Select
                  value={updateFormData.expense_category}
                  onValueChange={(v) => setUpdateFormData("expense_category", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food_drink">Food & Drink</SelectItem>
                    <SelectItem value="grocery">Grocery</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
                {updateErrors.expense_category && <p className="text-red-500 text-sm">{updateErrors.expense_category}</p>}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={updateProcessing}>Update Transaction</Button>
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
            Are you sure you want to delete <strong>{transactionToDelete?.title}</strong>?
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
