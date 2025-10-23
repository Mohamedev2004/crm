"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';

// ✅ Export Lead type
export interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  service: string;
  source: "social" | "call" | "email" | "others";
  content?: string | null;
  client?: { id: number; name: string } | null;
  status?: string | null;
  created_by?: { id: number; name: string; role?: string } | null;
  created_at: string;
}

// ✅ Columns
export const columns = (
  onUpdate: (lead: Lead) => void,
  onDelete: (lead: Lead) => void,
  onSetStatus: (lead: Lead, status: string) => void // new callback for status updates
): ColumnDef<Lead>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-1 ml-1 border-black dark:border-white"
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => row.original.email || "-",
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => row.original.phone || "-",
  },
  {
    accessorKey: "service",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
  },
  {
  accessorKey: "source",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
  cell: ({ row }) => {
    const value = row.getValue("source") as string;
    const color = {
      social: "bg-blue-100 text-blue-800",
      call: "bg-green-100 text-green-800",
      email: "bg-yellow-100 text-yellow-800",
      others: "bg-gray-100 text-gray-800",
    }[value];

    return (
      <Badge className={`inline-flex items-center text-xs font-semibold ${color}`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    );
  },
},
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    filterFn: (row, columnId, filterValue) => {
      const rowClientId = String(row.original.client?.id ?? 0);
      return rowClientId === filterValue;
    },
    cell: ({ row }) =>
      row.original.client ? (
        row.original.client.name
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      ),
  },
{
  accessorKey: "status",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  filterFn: (row, columnId, filterValue) => {
    const rowStatus = row.original.status ?? "";
    return rowStatus === filterValue;
  },
  cell: ({ row }) => {
    const status = row.original.status ?? "Unassigned";

    const color = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-purple-100 text-purple-800",
      qualified: "bg-yellow-100 text-yellow-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
      "Unassigned": "bg-gray-100 text-gray-800",
    }[status];

    return (
      <Badge className={`inline-flex items-center text-xs font-semibold ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  },
},
  {
    accessorKey: "created_by",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
    filterFn: (row, columnId, filterValue) => {
      const creator = row.original.created_by;
      if (!creator) return filterValue === "admin";
      return String(creator.id) === filterValue;
    },
    cell: ({ row }) => {
      const createdBy = row.original.created_by;
      if (!createdBy) return <span>Admin</span>;
      if (createdBy.role === "commercial") return createdBy.name;
      return <span>Admin</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
  id: "actions",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
  cell: ({ row }) => {
    const lead = row.original;

    // Define allowed next statuses based on current status
    const nextStatuses: Record<string, string[]> = {
      new: ["contacted", "lost"],
      contacted: ["qualified", "lost"],
      qualified: ["converted", "lost"],
      converted: [],
      lost: [],
    };

    const allowedStatuses = nextStatuses[lead.status || ""] || [];

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

          {/* Edit */}
          <DropdownMenuItem onClick={() => onUpdate(lead)}>
            <SquarePen className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          {/* Status update buttons */}
          {allowedStatuses.length > 0 && <DropdownMenuSeparator />}
          {allowedStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => onSetStatus(lead, status)}
              className="capitalize"
            >
              Set {status.charAt(0).toUpperCase() + status.slice(1)}
            </DropdownMenuItem>
          ))}

          {/* Delete */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(lead)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
];
