/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { router } from "@inertiajs/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Report {
  id: number;
  number?: number;
  gestational_age_weeks?: number;
  created_at: string;
  pdf_path?: string | null;
}

export const createReportColumns = (
  patientId: number,
  currentSortBy?: string,
  currentSortDir?: "asc" | "desc",
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void
): ColumnDef<Report>[] => [
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
    accessorKey: "number",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="N°"
        columnId="number"
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => <span className="font-medium">Rapport - {row.original.number}</span>,
  },
 /*  {
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
    cell: ({ row }) => <span className="">{row.original.id}</span>,
  }, */
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
  {
    accessorKey: "pdf_path",
    header: "PDF",
    cell: ({ row }) => {
      const pdfPath = row.original.pdf_path;
      if (!pdfPath) return <span className="text-muted-foreground text-xs italic">Indisponible</span>;

      return (
        <Badge className="mr-2">
        <a
          href={route("patients.reports.download", {
            patient: patientId,
            report: row.original.id,
          })}
          className="inline-flex items-center hover:underline font-medium text-sm"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4 mr-1" />
          Télécharger
        </a>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          router.visit(
            route("patients.reports.show", {
              patient: patientId,
              report: row.original.id,
            })
          )
        }
      >
        <Eye className="w-4 h-4 mr-1" />
        Voir
      </Button>
    ),
  },
];