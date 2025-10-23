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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Type definition for filter options passed from leads.tsx
type FilterOption = {
    id: number | string;
    name: string;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    rowSelection: Record<string, boolean>;
    setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    statusFilterOptions: FilterOption[];
    clientFilterOptions: FilterOption[];
    createdByFilterOptions: FilterOption[];
}

export function DataTable<TData, TValue>({
    columns,
    data = [],
    rowSelection,
    setRowSelection,
    statusFilterOptions,
    clientFilterOptions,
    createdByFilterOptions,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    // Local filter states
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [clientFilter, setClientFilter] = React.useState<string>("all");
    const [createdByFilter, setCreatedByFilter] = React.useState<string>("all");

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

    const nameFilterValue = (table.getColumn("name")?.getFilterValue() as string) ?? "";

    const setNameFilterValue = (value: string) => {
        table.getColumn("name")?.setFilterValue(value);
    }

    // Sync local select filters with react-table
    React.useEffect(() => {
        const filters: ColumnFiltersState = [];

        if (nameFilterValue) filters.push({ id: 'name', value: nameFilterValue });
        if (statusFilter !== "all") filters.push({ id: 'status', value: statusFilter });
        if (clientFilter !== "all") filters.push({ id: 'client', value: clientFilter });
        if (createdByFilter !== "all") filters.push({ id: 'created_by', value: createdByFilter });

        table.setColumnFilters(filters);
    }, [statusFilter, clientFilter, createdByFilter, nameFilterValue, table]);

    // Clear filters
    const handleClearFilters = () => {
        table.getColumn("name")?.setFilterValue("");
        setStatusFilter("all");
        setClientFilter("all");
        setCreatedByFilter("all");
    }

    return (
        <div className="w-full">
            {/* Top Filters & View Options */}
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-wrap items-center gap-4">

                    {/* Search Filter */}
    {table.getColumn("name") && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="search-name" className="whitespace-nowrap">Search Name</Label>
            <Input
                id="search-name"
                placeholder="Search leads by name..."
                value={nameFilterValue}
                onChange={(event) => setNameFilterValue(event.target.value)}
                className="w-full sm:w-64"
            />
        </div>
    )}

    {/* Status Filter */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        <Label htmlFor="filter-status" className="whitespace-nowrap">Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="filter-status" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusFilterOptions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>

    {/* Client Filter with Searchable Combobox (Fixed) */}
<div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
  <Label htmlFor="filter-client" className="whitespace-nowrap">Client</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full sm:w-[180px] justify-between"
      >
        {clientFilter === "all"
          ? "All Clients"
          : clientFilterOptions.find((c) => String(c.id) === clientFilter)?.name}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[200px] p-0">
      <Command shouldFilter={true}>
        <CommandInput placeholder="Search clients..." />
        <CommandEmpty>No client found.</CommandEmpty>
        <CommandGroup>
          {/* All option */}
          <CommandItem
            value="all"
            onSelect={() => setClientFilter("all")}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                clientFilter === "all" ? "opacity-100" : "opacity-0"
              )}
            />
            All Clients
          </CommandItem>

          {/* Map through clients */}
          {clientFilterOptions.map((c) => (
            <CommandItem
              key={c.id}
              value={c.name.toLowerCase()} // ✅ ensures search works properly
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


    {/* Created By Filter */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        <Label htmlFor="filter-created-by" className="whitespace-nowrap">Created By</Label>
        <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
            <SelectTrigger id="filter-created-by" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Creator" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Commercials</SelectItem>
                {createdByFilterOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>

    {/* Clear Filters Button */}
    {(nameFilterValue || statusFilter !== "all" || clientFilter !== "all" || createdByFilter !== "all") && (
        <Button variant="outline" onClick={handleClearFilters} className="h-9 w-full sm:w-auto">
            Clear Filters
        </Button>
    )}

    {/* Table View Options */}
    <div className="ml-auto w-full sm:w-auto">
        <DataTableViewOptions table={table} />
    </div>
                </div>
            </div>

            {/* Selected Rows Info */}
            <div className="text-muted-foreground text-sm mb-2">
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
