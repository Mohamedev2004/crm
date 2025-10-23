"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Label } from "@/components/ui/label";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  clients?: { id: number; name: string }[];
}

export function DataTable<TData extends { client?: { id: number; name: string } | null }, TValue>({
  columns,
  data = [],
  rowSelection,
  setRowSelection,
  clients = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full">
      {/* Top Filters & View Options */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2 py-4">
  {/* Search + Client Filter */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
    {/* Search */}
    {table.getColumn("title") && (
      <div className="flex items-center gap-2">
        <Label htmlFor="Search" className="whitespace-nowrap">Search</Label>
        <Input
          placeholder="Search..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-64"
        />
      </div>
    )}
    {/* Stage Filter */}
    {table.getColumn("stage") && (
      <div className="flex items-center gap-2">
        <Label htmlFor="stageFilter" className="whitespace-nowrap">Stage</Label>
        <Select
          onValueChange={(value) =>
            table.getColumn("stage")?.setFilterValue(value === "all" ? "" : value)
          }
          value={(table.getColumn("stage")?.getFilterValue() as string) || "all"}
        >
          <SelectTrigger id="stageFilter" className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}

    {/* Client Filter */}
    {clients.length > 0 && table.getColumn("client") && (
      <div className="flex items-center gap-2">
        <Label htmlFor="clientFilter" className="whitespace-nowrap">Client</Label>
        <Select
          onValueChange={(value) =>
            table.getColumn("client")?.setFilterValue(value === "all" ? "" : value)
          }
          value={(table.getColumn("client")?.getFilterValue() as string) || "all"}
        >
          <SelectTrigger id="clientFilter" className="w-48">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={String(client.id)}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
  </div>

  {/* Table View Options */}
  <div className="flex justify-start md:justify-end w-full md:w-auto">
    <DataTableViewOptions table={table} />
  </div>
</div>

      {/* Selected Rows Info */}
      <div className="text-muted-foreground text-sm mb-2">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
