/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
"use client";

import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props<TData> {
  columns: any;
  data: TData[];
  filters: any;
  pagination: { page: number; pageCount: number; perPage: number };
  onFilterChange: (key: string, value: any) => void;
  onPerPageChange: (perPage: number) => void;
  onPageChange: (page: number) => void;
  onAddClick?: () => void;
}

export function ReportDataTable<TData>({
  columns,
  data,
  filters,
  pagination,
  onFilterChange,
  onPerPageChange,
  onPageChange,
  onAddClick,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => `${row.id}`,
  });

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    // Only trigger filter change if search input is different from current filters
    if (searchInput === (filters.search ?? "")) {
      return;
    }

    const handler = setTimeout(() => {
      onFilterChange("search", searchInput);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  // Sync search input with filters.search when it changes (e.g., on back button)
  useEffect(() => {
    setSearchInput(filters.search ?? "");
  }, [filters.search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Rechercher par numéro (ex: 1)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        {onAddClick && (
          <Button onClick={onAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un Rapport
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        perPage={pagination.perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  );
}