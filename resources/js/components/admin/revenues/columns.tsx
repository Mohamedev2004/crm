"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";

export interface Revenue {
  id: number;
  deal?: { id: number; title: string } | null;
  amount: number;
  payment_date: string;
  created_at: string;
}

export const columns = (): ColumnDef<Revenue>[] => [
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
    accessorKey: "deal",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Deal" />,
    cell: ({ row }) => row.original.deal?.title || "N/A",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.deal?.id === Number(filterValue);
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => `${Number(row.original.amount).toFixed(2)} Dhs`,
  },
  {
    accessorKey: "payment_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Date" />,
    cell: ({ row }) => new Date(row.original.payment_date).toLocaleDateString(),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
];
