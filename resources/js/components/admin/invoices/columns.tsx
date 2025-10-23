"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  SquarePen,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  CheckSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type Invoice = {
  id: number;
  invoice_number: string;
  title: string;
  description: string;
  client_name: string | null;
  client_email: string | null;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "overdue" | "paid";
  currency: "USD";
  due_date: string | null;
  created_at: string;
  file_path: string | null;
};

export const columns = (
  onUpdate: (invoice: Invoice) => void,
  onDelete: (invoice: Invoice) => void,
  onDownload: (invoice: Invoice) => void,
  onSetPaid: (invoice: Invoice) => void,
  onSetOverdue: (invoice: Invoice) => void
): ColumnDef<Invoice>[] => [
  // ✅ Checkbox column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-black dark:border-white ml-1"
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
        className="border border-black dark:border-white"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ✅ Invoice number
  {
    accessorKey: "invoice_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice #" />
    ),
  },

  // ✅ Title
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[150px]">{invoice.title}</span>
        </div>
      );
    },
  },

  // ✅ Client info
  {
    accessorKey: "client_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="flex flex-col gap-1">
          <span>{invoice.client_name || "-"}</span>
          <span className="text-xs text-muted-foreground truncate">
            {invoice.client_email || "-"}
          </span>
        </div>
      );
    },
  },

  // ✅ Total
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">${row.original.total.toFixed(2)}</Badge>
    ),
  },

  // ✅ Status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const icon =
        status === "pending" ? (
          <Clock className="w-4 h-4 mr-1" />
        ) : status === "paid" ? (
          <CheckCircle className="w-4 h-4 mr-1" />
        ) : status === "overdue" ? (
          <CheckSquare className="w-4 h-4 mr-1" />
        ) : (
          <XCircle className="w-4 h-4 mr-1" />
        );

      const color =
        status === "paid"
          ? "bg-green-100 text-green-700"
          : status === "overdue"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700";

      return (
        <Badge
          variant="secondary"
          className={`flex items-center capitalize ${color}`}
        >
          {icon}
          {status}
        </Badge>
      );
    },
  },

  // ✅ Created at
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString(),
  },

  // ✅ Actions
  {
  id: "actions",
  cell: ({ row }) => {
    const invoice = row.original;
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

          {/* Always show Edit */}
          <DropdownMenuItem onClick={() => onUpdate(invoice)}>
            <SquarePen className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>

          {/* Always show Download */}
          <DropdownMenuItem onClick={() => onDownload(invoice)}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Only show these if status is pending */}
          {invoice.status === "pending" && (
            <>
              <DropdownMenuItem onClick={() => onSetPaid(invoice)}>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onSetOverdue(invoice)}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Mark as Overdue
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}

          {/* Always show Delete */}
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(invoice)}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
];
