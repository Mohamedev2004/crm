/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleX, Clock, MoreHorizontal, SquarePen } from "lucide-react";

export interface Appointment {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  appointment_date: string; // ISO string
  status: "pending" | "confirmed" | "completed" | "cancelled";
  note?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export function createAppointmentColumns(opts: {
  onConfirm: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onComplete: (a: Appointment) => void;
  onEdit?: (a: Appointment) => void;
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
}): ColumnDef<Appointment>[] {
  const { onConfirm, onCancel, onComplete, onEdit, currentSortBy, currentSortDir, onSortChange } = opts;

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          disabled={table.getRowModel().rows.every((row) => !row.getCanSelect())}
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          disabled={!row.getCanSelect()}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="ID"
          columnId="id"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Nom"
          columnId="full_name"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Téléphone"
          columnId="phone"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
          columnId="email"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.getValue("email") || <span className="text-muted-foreground italic">-</span>,
    },
    {
      accessorKey: "appointment_date",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date & heure"
          columnId="appointment_date"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const raw = row.getValue("appointment_date") as string;
        const d = new Date((raw ?? "").toString().replace(" ", "T"));
        if (isNaN(d.getTime())) return "";
        return d.toLocaleString();
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Statut"
          columnId="status"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as Appointment["status"];
        const variant: Record<Appointment["status"], "pending" | "in_progress" | "success" | "danger"> = {
          pending: "pending",
          confirmed: "success",
          completed: "in_progress",
          cancelled: "danger",
        };
        const labels: Record<Appointment["status"], string> = {
          pending: "En attente",
          confirmed: "Confirmé",
          completed: "Terminé",
          cancelled: "Annulé",
        };
        return <Badge variant={variant[status]}>{labels[status]}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const a = row.original as Appointment;
        if (a.status === "completed") {
          return null;
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(a)}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onConfirm(a)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onComplete(a)}>
                <Clock className="mr-2 h-4 w-4" /> Marquer terminé
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCancel(a)} variant="destructive">
                <CircleX className="mr-2 h-4 w-4" /> Annuler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
