/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, SquarePen, Trash2, Undo2 } from "lucide-react";
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

export interface Newsletter {
  id: number;
  name?: string;
  email: string;
  created_at: string;
  deleted_at?: string | null;
}

export const createNewsletterColumns = (
  onDelete: (newsletter: Newsletter) => void,
  onRestore: (newsletter: Newsletter) => void,
  onEdit: (newsletter: Newsletter) => void,
  currentSortBy?: string,
  currentSortDir?: "asc" | "desc",
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void
): ColumnDef<Newsletter>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Courriel"
        columnId="email"
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("email")}</span>,
  },
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) => {
      const isDeleted = !!row.original.deleted_at;
      return (
        <Badge variant={isDeleted ? "destructive" : "outline"}>
          {isDeleted ? "Désabonné" : "Actif"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Abonné le"
        columnId="created_at"
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("fr-FR"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const newsletter = row.original;
      const isDeleted = !!newsletter.deleted_at;

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

            {!isDeleted && (
              <>
                <DropdownMenuItem onClick={() => onEdit(newsletter)}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(newsletter)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Désabonner
                </DropdownMenuItem>
              </>
            )}

            {isDeleted && (
              <DropdownMenuItem onClick={() => onRestore(newsletter)}>
                <Undo2 className="mr-2 h-4 w-4" />
                Restaurer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
