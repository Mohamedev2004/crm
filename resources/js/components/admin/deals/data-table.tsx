"use client";

import * as React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [clientFilter, setClientFilter] = React.useState<string>("all");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  // Sync client filter with react-table
  React.useEffect(() => {
    table.setColumnFilters([
      ...table.getState().columnFilters.filter((f) => f.id !== "client"),
      ...(clientFilter !== "all" ? [{ id: "client", value: clientFilter }] : []),
    ]);
  }, [clientFilter, table]);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
          {/* Search */}
          {table.getColumn("title") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          )}

          {/* Stage Filter */}
          {table.getColumn("stage") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="stageFilter">Stage</Label>
              <Select
                value={(table.getColumn("stage")?.getFilterValue() as string) || "all"}
                onValueChange={(value) =>
                  table.getColumn("stage")?.setFilterValue(value === "all" ? "" : value)
                }
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

          {/* Client Filter (Searchable) */}
          {table.getColumn("client") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="clientFilter">Client</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-48 justify-between"
                  >
                    {clientFilter === "all"
                      ? "All Clients"
                      : clients.find((c) => String(c.id) === clientFilter)?.name}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter>
                    <CommandInput placeholder="Search clients..." />
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all" onSelect={() => setClientFilter("all")}>
                        <Check className={cn("mr-2 h-4 w-4", clientFilter === "all" ? "opacity-100" : "opacity-0")} />
                        All Clients
                      </CommandItem>
                      {clients.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name.toLowerCase()}
                          onSelect={() => setClientFilter(String(c.id))}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              clientFilter === String(c.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex justify-start md:justify-end w-full md:w-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Selected rows info */}
      <div className="text-sm text-muted-foreground mb-2">
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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
