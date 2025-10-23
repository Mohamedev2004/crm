"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { CopyButton } from "@/components/CopyButton";
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

export type Commercial = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "commercial";
  clients_count: number;
  created_at: string;
  deleted_at: string | null;
};

export const columns = (onUpdate: (user: Commercial) => void, onDelete: (user: Commercial) => void): ColumnDef<Commercial>[] => [
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
    cell: ({ row }) => {
      const commercial = row.original;
      return (
        <div className="flex items-center gap-2">
          <CopyButton
            content={commercial.name}
            variant="ghost"
            size="sm"
            className="h-auto w-auto p-2 border-1 border-gray-300"
          />
          <span className="truncate max-w-[150px]">{commercial.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const commercial = row.original;
      return (
        <div className="flex items-center gap-2">
          <CopyButton
            content={commercial.email}
            variant="ghost"
            size="sm"
            className="h-auto w-auto p-2 border-1 border-gray-300"
          />
          <span className="truncate max-w-[150px]">{commercial.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "clients_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clients" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.clients_count}</Badge>,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
    id: "actions",
    cell: ({ row }) => {
      const commercial = row.original;

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
            <DropdownMenuItem onClick={() => onUpdate(commercial)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(commercial)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
