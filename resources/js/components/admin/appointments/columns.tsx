"use client";

import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { CheckCircle, CheckCircle2, CheckSquare, Clock, Eye, MoreHorizontal, XCircle } from "lucide-react";
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
import { DataTableColumnHeader } from "../../data-table-column-header";
import { Badge } from "@/components/ui/badge";

export interface Appointment {
  id: number;
  appointment_name: string;
  appointment_email: string;
  appointment_phone: string;
  appointment_date: string;
  appointment_message: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
}

const statusFilterFn: FilterFn<Appointment> = (row, columnId, filterValue) => {
  if (filterValue === "all") {
    return true;
  }
  const rowValue = row.getValue(columnId) as string;
  return rowValue === filterValue;
};

export const createColumns = (
  onSetConfirmed: (appointement: Appointment) => void,
  onSetCompleted: (appointement: Appointment) => void,
  onSetCancelled: (appointement: Appointment) => void,
  onView: (appointment: Appointment) => void
): ColumnDef<Appointment>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
      className="border border-1 border-black dark:border-white"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
      className="border border-1 border-black dark:border-white"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  },
  {
    accessorKey: "appointment_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "appointment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.appointment_date);
      const formattedDate = date.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "appointment_email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "appointment_phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
  },
  {
    accessorKey: "appointment_message",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
    ),
    cell: ({ row }) => {
        const message = row.original.appointment_message || "";
        const truncated =
        message.length > 50 ? message.slice(0, 50) + "..." : message;
        return (
        <span title={message} className="truncate max-w-[250px] block">
            {truncated}
        </span>
        );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    filterFn: statusFilterFn,
    cell: ({ row }) => {
      const status = row.original.status;

      // Map each status to an icon
      const statusIcon = 
        status === "Pending" ? <Clock className="w-4 h-4 mr-1" /> :
        status === "Confirmed" ? <CheckCircle className="w-4 h-4 mr-1" /> :
        status === "Completed" ? <CheckSquare className="w-4 h-4 mr-1" /> :
        <XCircle className="w-4 h-4 mr-1" />; // Cancelled

      return (
        <Badge variant='default' className="flex items-center">
          {statusIcon}
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(appointment)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            {appointment.status === "Pending" && (
              <DropdownMenuItem onClick={() => onSetConfirmed(appointment)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Set Confirmed
              </DropdownMenuItem>
            )}
            {/* <DropdownMenuItem onClick={() => onSetConfirmed(appointment)}>
              <XCircle className="mr-2 h-4 w-4" />
              Set Confirmed
            </DropdownMenuItem> */}
            {appointment.status === "Confirmed" && (
            <DropdownMenuItem onClick={() => onSetCompleted(appointment)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Set Completed
            </DropdownMenuItem>
            )}
            {appointment.status === "Pending" && (
            <DropdownMenuItem onClick={() => onSetCancelled(appointment)}>
              <XCircle className="mr-2 h-4 w-4" />
              Set Cancelled
            </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
