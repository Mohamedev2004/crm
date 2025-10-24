"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: "lead" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  notes?: string | null;
  client?: { id: number; name: string } | null;
  created_by?: { id: number; name: string; role?: string } | null;
  created_at: string;
}

interface ColumnsProps {
  onSetStage: (deal: Deal, stage: string) => void;
}

export const columns = ({ onSetStage }: ColumnsProps): ColumnDef<Deal>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
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
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
  },
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    cell: ({ row }) => `${Number(row.original.value || 0).toFixed(2)} Dhs`,
  },
  {
    accessorKey: "stage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
    cell: ({ row }) => {
      const colorMap: Record<string, string> = {
        lead: "bg-blue-100 text-blue-800",
        proposal: "bg-yellow-100 text-yellow-800",
        negotiation: "bg-purple-100 text-purple-800",
        closed_won: "bg-green-100 text-green-800",
        closed_lost: "bg-red-100 text-red-800",
      };
      const color = colorMap[row.original.stage] || "bg-gray-100 text-gray-800";
      return (
        <Badge className={`inline-flex capitalize items-center text-xs font-semibold ${color}`}>
          {row.original.stage.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === "all") return true;
      return row.original.stage === filterValue;
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => row.original.client?.name || "Unassigned",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === "all") return true;
      return row.original.client?.id === Number(filterValue);
    },
  },
  {
    accessorKey: "created_by",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
    cell: ({ row }) => {
      const creator = row.original.created_by;
      if (!creator) return <span>Admin</span>;
      if (creator.role === "commercial") return creator.name;
      return <span>Admin</span>;
    },
    filterFn: (row, columnId, filterValue) => {
      const creator = row.original.created_by;
      if (!creator) return filterValue === "admin";
      return String(creator.id) === filterValue;
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
      const deal = row.original;
      const nextStages: Record<string, string[]> = {
        lead: ["proposal", "closed_lost"],
        proposal: ["negotiation", "closed_lost"],
        negotiation: ["closed_won", "closed_lost"],
        closed_won: [],
        closed_lost: [],
      };
      const allowedStages = nextStages[deal.stage || ""] || [];
      if (!allowedStages.length) return null;

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
            {allowedStages.map((stage) => (
              <DropdownMenuItem
                key={stage}
                onClick={() => onSetStage(deal, stage)}
                className="capitalize"
              >
                Set {stage.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
