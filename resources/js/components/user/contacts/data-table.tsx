/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPen, Plus } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

type Filters = {
  search?: string;
  trashed?: "all" | "actifs" | "deleted";
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
};

type Pagination = {
  page: number;
  pageCount: number;
  perPage: number;
};

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filters: Filters;
  pagination: Pagination;
  onFilterChange: (key: keyof Filters, value: any) => void;
  onPerPageChange: (perPage: number) => void;
  onPageChange: (page: number) => void;
  onAddClick?: () => void;
};

export function ContactsDataTable<TData, TValue>({
  columns,
  data = [],
  rowSelection,
  setRowSelection,
  filters,
  pagination,
  onFilterChange,
  onPerPageChange,
  onPageChange,
  onAddClick,
}: Props<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => `${row.id}`,
    enableRowSelection: (row: any) => row.original?.status !== "completed",
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Debounce search input
  useEffect(() => {
    if (searchInput === (filters.search ?? "")) return;
    const handler = setTimeout(() => onFilterChange("search", searchInput), 500);
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

   const hasData = data.length > 0;
  /* const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;
  const selectedIdsAsNumbers = selectedIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n)); */

  return (
    <div className="w-full">
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-foreground">
                <FolderPen className="text-background" />
              </EmptyMedia>
              <EmptyTitle>Aucun contact</EmptyTitle>
              <EmptyDescription>
                Aucun contact ne correspond à vos filtres. Ajoutez-en un pour commencer.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              {onAddClick && (
                <Button onClick={onAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un contact
                </Button>
              )}
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="rounded-lg mt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher..."
                className="w-[240px]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onAddClick && (
                <Button onClick={onAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un contact
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
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

          <div className="pt-4">
            <DataTablePagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              perPage={pagination.perPage}
              onPageChange={onPageChange}
              onPerPageChange={onPerPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
