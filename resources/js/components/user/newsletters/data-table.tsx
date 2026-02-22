"use client";
/* eslint-disable import/order */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, Plus, FolderCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface NewsletterDataTableProps<TData> {
  columns: any;
  data: TData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: (val: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => void;
  filters: Record<string, any>;
  pagination: { page: number; pageCount: number; perPage: number };
  hasSoftDeleted?: boolean;
  onRestoreAllClick?: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onFilterChange: (key: string, value: any) => void;
  onPerPageChange: (perPage: number) => void;
  onPageChange: (page: number) => void;
  onAddClick?: () => void;
}

export function NewsletterDataTable<TData>({
  columns,
  data = [],
  rowSelection,
  setRowSelection,
  filters,
  pagination,
  hasSoftDeleted,
  onRestoreAllClick,
  onBulkDelete,
  onFilterChange,
  onPerPageChange,
  onPageChange,
  onAddClick,
}: NewsletterDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => `${row.id}`,
    state: { rowSelection },
    onRowSelectionChange: (val) => setRowSelection(val as Record<string, boolean>),
  });

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    if (searchInput === (filters.search ?? "")) return;
    const handler = setTimeout(() => {
      onFilterChange("search", searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search, onFilterChange, searchInput]);

  const selectedIds = Object.keys(rowSelection);
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="w-full">

      {/* Empty state instead of table */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-foreground">
                <FolderCode className="text-background" />
              </EmptyMedia>
              <EmptyTitle>Aucun abonné trouvé</EmptyTitle>
              <EmptyDescription>
                Vous n&apos;avez aucun abonné pour le moment. Commencez par en ajouter un.
              </EmptyDescription>
            </EmptyHeader>

            {onAddClick && (
              <EmptyContent className="flex-row justify-center gap-2">
                <Button variant="default" size="sm" onClick={onAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un Abonné
                </Button>
              </EmptyContent>
            )}
          </Empty>
        </div>
      ) : (
        <>
          {/* Barre d'outils */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 flex-1 min-w-[250px]">
              <Input
                placeholder="Rechercher un courriel..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="max-w-xs"
                />

              <Select value={filters.trashed ?? "all"} onValueChange={(value) => onFilterChange("trashed", value)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="subscribed">Abonnés</SelectItem>
                  <SelectItem value="unsubscribed">Désabonnés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {hasSelection && onBulkDelete && (
                <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedIds)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Désabonner ({selectedIds.length})
                </Button>
              )}
              {hasSoftDeleted && (
                <Button variant="outline" onClick={onRestoreAllClick}>
                  <Undo2 className="mr-2 h-4 w-4" /> Restaurer tout
                </Button>
              )}
              {onAddClick && (
                <Button variant="default" size="sm" onClick={onAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un Abonné
                </Button>
              )}
              <DataTableViewOptions table={table} />
            </div>
          </div>
          {/* Tableau */}
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
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <DataTablePagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            perPage={pagination.perPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        </>
      )}
    </div>
  );
}