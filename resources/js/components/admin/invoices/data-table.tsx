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
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  rowSelection,
  setRowSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

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
      {/* Top controls: Search + Status Filter + View Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        {/* Left group: Search + Status filter side by side */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          {/* Search */}
          {table.getColumn("title") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="search" className="whitespace-nowrap">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="w-full sm:w-[250px]"
              />
            </div>
          )}

          {/* Status Filter */}
          {table.getColumn("status") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="status_filter" className="whitespace-nowrap">
                Status
              </Label>
              <Select
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("status")?.setFilterValue(undefined); // clear filter
                  } else {
                    table.getColumn("status")?.setFilterValue(value);
                  }
                }}
                value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              >
                <SelectTrigger className="sm:w-[180px] w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Overdue
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Right group: View options */}
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
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-3 py-2"
                    >
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
