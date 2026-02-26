/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, CircleX, Eye, MoreHorizontal, SquarePen, Trash2, Undo2 } from "lucide-react";
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

import type { Patient } from "@/types/patient";
import { router } from "@inertiajs/react";

interface CreatePatientColumnsProps {
  onDelete: (patient: Patient) => void;
  onRestore: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onEditMedical: (patient: Patient) => void;
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
}

export const createPatientColumns = ({
  onDelete,
  onRestore,
  onEdit,
  onEditMedical,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: CreatePatientColumnsProps): ColumnDef<Patient>[] => [
  // Selection
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

  // ID
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

  // Full Name
  {
    id: "full_name",
    header: "Nom complet",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.first_name} {row.original.last_name}
      </span>
    ),
  },

  // Email
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
    cell: ({ row }) =>
      row.original.email ? (
        <span>{row.original.email}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },

  // Phone
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

  // Address
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) =>
      row.original.address ? (
        <span>{row.original.address}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },

  // Date of Birth
  {
    accessorKey: "date_of_birth",
    header: "Date de naissance",
    cell: ({ row }) =>
      new Date(row.original.date_of_birth).toLocaleDateString("fr-FR"),
  },

  // CIN
  {
    accessorKey: "cin",
    header: "CIN",
    cell: ({ row }) =>
      row.original.cin ? (
        <span>{row.original.cin}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },

  // Blood Group
  {
    accessorKey: "blood_group",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Groupe sanguin"
        columnId="blood_group"
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) =>
      row.original.blood_group ? (
        <Badge variant="secondary">{row.original.blood_group}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },

  // Allergies
{
  accessorKey: "allergies",
  header: "Allergies",
  cell: ({ row }) => {
    const value = row.original.allergies;

    if (!value) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
      <span
        className="max-w-[200px] truncate block"
        title={value}
      >
        {value}
      </span>
    );
  },
},

// Chronic Diseases
{
  accessorKey: "chronic_diseases",
  header: "Maladies chroniques",
  cell: ({ row }) => {
    const value = row.original.chronic_diseases;

    if (!value) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
      <span
        className="max-w-[200px] truncate block"
        title={value}
      >
        {value}
      </span>
    );
  },
},

// Notes
{
  accessorKey: "notes",
  header: "Notes",
  cell: ({ row }) => {
    const value = row.original.notes;

    if (!value) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
      <span
        className="max-w-[200px] truncate block"
        title={value}
      >
        {value}
      </span>
    );
  },
},

  // Pregnancy
    {
    id: "pregnancy",
    header: "Grossesse",
    cell: ({ row }) => {
        const isPregnant = !!row.original.is_pregnant;

        return (
            <div className="flex justify-center">
            {isPregnant ? (
                <CircleCheck className="h-5 w-5 text-green-600" />
            ) : (
                <CircleX className="h-5 w-5 text-red-600" />
            )}
            </div>
        );
        },
    },

  // Status
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) => {
      const isDeleted = !!row.original.deleted_at;
      return (
        <Badge variant={isDeleted ? "destructive" : "outline"}>
          {isDeleted ? "Supprimé" : "Actif"}
        </Badge>
      );
    },
  },

  // Created At
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Créé le"
        columnId="created_at"
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("fr-FR"),
  },

  // Actions
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const patient = row.original;
      const isDeleted = !!patient.deleted_at;

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
                <DropdownMenuItem
                  onClick={() => router.get(route("patients.show", patient.id))}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir Détails
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onEdit(patient)}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Modifier les infos de base
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onEditMedical(patient)}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Modifier les infos médicales
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(patient)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}

            {isDeleted && (
              <DropdownMenuItem onClick={() => onRestore(patient)}>
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