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
import { Eye, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export function createContactColumns(opts: {
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete: (contact: Contact) => void,
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
}): ColumnDef<Contact>[] {
  const {onView, onEdit, onDelete, currentSortBy, currentSortDir, onSortChange } = opts;

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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Nom"
          columnId="name"
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
      cell: ({ row }) => row.getValue("email") || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Sujet"
          columnId="subject"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const raw = row.getValue("subject") as string;
        if (!raw) return <span className="text-muted-foreground">-</span>;
        return raw.length > 30 ? raw.substring(0, 30) + "..." : raw;
      },
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Message"
          columnId="message"
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const raw = row.getValue("message") as string;
        if (!raw) return <span className="text-muted-foreground">-</span>;
        return raw.length > 30 ? raw.substring(0, 30) + "..." : raw;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const contact = row.original as Contact;

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

              {onView && (
                <DropdownMenuItem onClick={() => onView(contact)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir
                </DropdownMenuItem>
              )}

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(contact)}
                  variant="destructive"
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }

  ];
}
