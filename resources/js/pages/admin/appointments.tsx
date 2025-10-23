/* eslint-disable no-irregular-whitespace */
"use client";

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react'; // Added useForm
import { createColumns, Appointment } from "@/components/admin/appointments/columns";
import { DataTable } from "@/components/admin/appointments/data-table";
import { useState, useEffect } from 'react';

// Shadcn UI components for the modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Plus, CheckSquare, CheckCircle } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Application", href: "#" },
  {
    title: 'Appointments',
    href: '/appointments',
  },
];

interface Props {
  appointments: Appointment[];
  flash?: {
    success?: string;
    error?: string;
  };
  auth: {
    user: {
      role: 'admin' | 'client' | 'commercial';
      name: string;
    };
  };
}

export default function Appointments({ appointments, flash, auth }: Props) {
  const [data, setData] = useState<Appointment[]>(appointments ?? []);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Corrected useForm state to match the appointment schema
    const { data: createFormData, setData: setCreateFormData, post, processing: createProcessing, errors: createErrors, reset: resetCreateForm } = useForm({
        appointment_name: '',
        appointment_phone: '',
        appointment_email: '',
        appointment_message: '',
        appointment_date: '',
   });

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [appointmentToView, setAppointmentToView] = useState<Appointment | null>(null);

  // Bulk confirm modal
  const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
  const [isBulkCancelModalOpen, setIsBulkCancelModalOpen] = useState(false);
  const [isBulkCompleteModalOpen, setIsBulkCompleteModalOpen] = useState(false);

  useEffect(() => {
    setData(appointments);
  }, [appointments]);

  useEffect(() => {
    if (flash?.success) {
      setToastMessage(flash.success);
      setToastType('success');
      setShowToast(true);
    } else if (flash?.error) {
      setToastMessage(flash.error);
      setToastType('error');
      setShowToast(true);
    }
  }, [flash]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // -- Row actions (single) --
  const handleViewClick = (appointment: Appointment) => {
    setAppointmentToView(appointment);
    setIsViewModalOpen(true);
  };

  const handleSetConfirmed = (appointment: Appointment) => {
    router.post(route('appointments.setConfirmed', appointment.id), {}, {
      onSuccess: () => {
        // update local UI: mark this appointment as Confirmed if it was pending
        setData(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'Confirmed' } : a));
        setToastMessage("Appointment status set to Confirmed!");
        setToastType("success");
        setShowToast(true);
      },
      onError: (errors) => {
        console.error("Failed to set appointment confirmed:", errors);
        setToastMessage("Failed to set appointment confirmed.");
        setToastType("error");
        setShowToast(true);
      },
    });
  };

  const handleSetCompleted = (appointment: Appointment) => {
    router.post(route('appointments.setCompleted', appointment.id), {}, {
      onSuccess: () => {
        setData(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'Completed' } : a));
        setToastMessage("Appointment status set to Completed!");
        setToastType("success");
        setShowToast(true);
      },
      onError: (errors) => {
        console.error("Failed to set appointment completed:", errors);
        setToastMessage("Failed to set appointment completed.");
        setToastType("error");
        setShowToast(true);
      },
    });
  };

  const handleSetCancelled = (appointment: Appointment) => {
    router.post(route('appointments.setCancelled', appointment.id), {}, {
      onSuccess: () => {
        setData(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'Cancelled' } : a));
        setToastMessage("Appointment status set to Cancelled!");
        setToastType("success");
        setShowToast(true);
      },
      onError: (errors) => {
        console.error("Failed to set appointment cancelled:", errors);
        setToastMessage("Failed to set appointment cancelled.");
        setToastType("error");
        setShowToast(true);
      },
    });
  };

  // -- Bulk confirm selected (follows Users bulk actions logic) --
  const handleBulkConfirm = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);
    if (selectedIds.length > 0) {
      setIsBulkConfirmModalOpen(true);
    }
  };

  const handleBulkCancel = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);
    if (selectedIds.length > 0) {
      setIsBulkCancelModalOpen(true);
    }
  };

  const handleBulkComplete = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);
    if (selectedIds.length > 0) {
      setIsBulkCompleteModalOpen(true);
    }
  };

  const handleConfirmBulkConfirm = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);

    router.post(
      route("appointments.confirmMany"),
      { appointment_ids: selectedIds },
      {
        onSuccess: () => {
          setIsBulkConfirmModalOpen(false);
          setRowSelection({});

          // update local UI: mark confirmed where they were Pending
          setData(prev =>
            prev.map(a =>
              selectedIds.includes(a.id) && a.status === 'Pending'
                ? { ...a, status: 'Confirmed' }
                : a
            )
          );

          setToastMessage("Selected appointments confirmed successfully!");
          setToastType("success");
          setShowToast(true);
        },
        onError: (errors) => {
          console.error("Bulk confirm failed:", errors);
          // if validator returned per-item errors, include the message if present
          const msg = errors?.message ?? "Failed to confirm selected appointments.";
          setToastMessage(msg);
          setToastType("error");
          setShowToast(true);
        },
      },
    );
  };

  const handleCancelBulkCancel = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);

    router.post(
      route("appointments.cancelMany"),
      { appointment_ids: selectedIds },
      {
        onSuccess: () => {
          setIsBulkCancelModalOpen(false);
          setRowSelection({});

          // update local UI: mark cancelled where they were Pending
          setData(prev =>
            prev.map(a =>
              selectedIds.includes(a.id) && a.status === 'Pending'
                ? { ...a, status: 'Cancelled' }
                : a
            )
          );

          setToastMessage("Selected appointments cancelled successfully!");
          setToastType("success");
          setShowToast(true);
        },
        onError: (errors) => {
          console.error("Bulk cancel failed:", errors);
          // if validator returned per-item errors, include the message if present
          const msg = errors?.message ?? "Failed to cancel selected appointments.";
          setToastMessage(msg);
          setToastType("error");
          setShowToast(true);
        },
      },
    );
  };

  const handleCompleteBulkCancel = () => {
    const selectedIds = Object.keys(rowSelection).map((key) => data[parseInt(key)].id);

    router.post(
      route("appointments.completeMany"),
      { appointment_ids: selectedIds },
      {
        onSuccess: () => {
          setIsBulkCompleteModalOpen(false);
          setRowSelection({});

          // update local UI: mark cancelled where they were Pending
          setData(prev =>
            prev.map(a =>
              selectedIds.includes(a.id) && a.status === 'Confirmed'
                ? { ...a, status: 'Completed' }
                : a
            )
          );

          setToastMessage("Selected appointments completed successfully!");
          setToastType("success");
          setShowToast(true);
        },
        onError: (errors) => {
          console.error("Bulk complete failed:", errors);
          // if validator returned per-item errors, include the message if present
          const msg = errors?.message ?? "Failed to complete selected appointments.";
          setToastMessage(msg);
          setToastType("error");
          setShowToast(true);
        },
      },
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("appointments.store"), {
        onSuccess: () => {
            setIsCreateModalOpen(false);
            resetCreateForm();
            setToastMessage("Appointment added successfully!");
            setToastType("success");
            setShowToast(true);
        },
        onError: (errors) => {
            console.error("Create failed:", errors);
            setToastMessage("Failed to add appointment.");
            setToastType("error");
            setShowToast(true);
        },
        });
    };

  // columns now include the single-row handlers (as you requested)
  const columns = createColumns(
    handleSetConfirmed,
    handleSetCompleted,
    handleSetCancelled,
    handleViewClick
  );

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Appointments" />
      <div className="w-full px-6 mx-auto py-10">
        {showToast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg text-white animate-in fade-in slide-in-from-top-5 ${
              toastType === 'success' ? 'bg-[var(--color-cocollab)] text-white dark:text-black dark:bg-[var(--color-cocollab-light)]' : 'bg-red-500'
            }`}
          >
            {toastType === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Manage Your Appointments
            </h2>
            <p className="text-sm max-w-4xl sm:text-base text-gray-600 dark:text-gray-300">
            This page displays all appointments. You can view detailed information for each appointment.
            </p>
        </div>

        </div>
        {/* Buttons container */}
        <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto mt-4 sm:mt-0 mb-4">
            {selectedCount > 0 && (
            <>
                <Button
                onClick={handleBulkComplete}
                variant="outline"
                className="flex items-center justify-center whitespace-nowrap md:max-w-max w-full sm:w-auto"
                >
                <CheckSquare className="mr-2 h-4 w-4" />
                Complete ({selectedCount})
                </Button>

                <Button
                onClick={handleBulkConfirm}
                variant="outline"
                className="flex items-center justify-center whitespace-nowrap md:max-w-max w-full sm:w-auto"
                >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm ({selectedCount})
                </Button>

                <Button
                onClick={handleBulkCancel}
                variant="destructive"
                className="flex items-center justify-center whitespace-nowrap md:max-w-max w-full sm:w-auto"
                >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel ({selectedCount})
                </Button>
            </>
            )}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle>Add New Appointment</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new appointment.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="appointment_name_create" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="appointment_name_create"
                                    value={createFormData.appointment_name}
                                    onChange={(e) => setCreateFormData('appointment_name', e.target.value)}
                                    className="col-span-3"
                                />
                                {createErrors.appointment_name && <p className="col-span-4 text-sm text-red-500">{createErrors.appointment_name}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="appointment_email_create" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="appointment_email_create"
                                    value={createFormData.appointment_email}
                                    onChange={(e) => setCreateFormData('appointment_email', e.target.value.toLowerCase())}
                                    className="col-span-3"
                                />
                                {createErrors.appointment_email && <p className="col-span-4 text-sm text-red-500">{createErrors.appointment_email}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="appointment_phone_create" className="text-right">
                                    Phone
                                </Label>
                                <Input
                                    id="appointment_phone_create"
                                    value={createFormData.appointment_phone}
                                    onChange={(e) => setCreateFormData('appointment_phone', e.target.value.replace(/\D/g, ""))}
                                    maxLength={10}
                                    className="col-span-3"
                                />
                                {createErrors.appointment_phone && <p className="col-span-4 text-sm text-red-500">{createErrors.appointment_phone}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="appointment_date_create" className="text-right">
                                    Date
                                </Label>
                                <Input
                                    id="appointment_date_create"
                                    type="datetime-local"
                                    value={createFormData.appointment_date}
                                    onChange={(e) => setCreateFormData('appointment_date', e.target.value)}
                                    className="col-span-3"
                                />
                                {createErrors.appointment_date && <p className="col-span-4 text-sm text-red-500">{createErrors.appointment_date}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="appointment_message_create" className="text-right">
                                    Message
                                </Label>
                                <Textarea
                                    id="appointment_message_create"
                                    value={createFormData.appointment_message}
                                    onChange={(e) => setCreateFormData('appointment_message', e.target.value)}
                                    className="col-span-3"
                                />
                                {createErrors.appointment_message && <p className="col-span-4 text-sm text-red-500">{createErrors.appointment_message}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={createProcessing}>
                                Save Appointment
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

      {/* View appointment Dialog/Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Details for {appointmentToView?.appointment_name ?? 'Appointment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-semibold">Name:</span>
              <span className="col-span-3">{appointmentToView?.appointment_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-semibold">Email:</span>
              <span className="col-span-3">{appointmentToView?.appointment_email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-semibold">Phone:</span>
              <span className="col-span-3">{appointmentToView?.appointment_phone}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-semibold">Date:</span>
              <span className="col-span-3">{appointmentToView?.appointment_date}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-semibold">Message:</span>
              <span className="col-span-3 break-all">{appointmentToView?.appointment_message}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirm Dialog */}
      <Dialog open={isBulkConfirmModalOpen} onOpenChange={setIsBulkConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointments</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm the selected appointments?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBulkConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBulkConfirm}>Confirm Appointments</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Cancel Dialog */}
      <Dialog open={isBulkCancelModalOpen} onOpenChange={setIsBulkCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointments</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the selected appointments?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBulkCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCancelBulkCancel}>Cancel Appointments</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Complete Dialog */}
      <Dialog open={isBulkCompleteModalOpen} onOpenChange={setIsBulkCompleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Appointments</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete the selected appointments?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBulkCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteBulkCancel}>Complete Appointments</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
