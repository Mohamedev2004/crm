/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Loader2, AlertTriangle, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ============================= */
/* Types */
/* ============================= */

interface ServerFilters {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  perPage?: number;
}

interface ServerPagination {
  page: number;
  pageCount: number;
  perPage: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSetSelectedPending?: (ids: string[]) => void;
  onSetSelectedInProgress?: (ids: string[]) => void;
  onSetSelectedDone?: (ids: string[]) => void;
  filters: ServerFilters;
  pagination: ServerPagination;
  onFilterChange: (key: "search" | "status" | "priority", value: string | undefined) => void;
  onPerPageChange: (perPage: number) => void;
  onPageChange: (page: number) => void;
  onAddClick?: () => void;
}

/* ============================= */
/* Component */
/* ============================= */

export function TasksDataTable<TData, TValue>({
  columns,
  data = [],
  rowSelection,
  setRowSelection,
  onSetSelectedPending,
  onSetSelectedInProgress,
  onSetSelectedDone,
  filters,
  pagination,
  onFilterChange,
  onPerPageChange,
  onPageChange,
  onAddClick,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => `${row.id}`,
    enableRowSelection: (row: any) => row.original.status !== 'done',
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
  });

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;

  /* ============================= */
  /* Filter Options */
  /* ============================= */

  const STATUS_OPTIONS = [
    { value: "pending", label: "En attente", icon: Clock },
    { value: "in_progress", label: "En cours", icon: Loader2 },
    { value: "done", label: "Terminé", icon: CheckCircle2 },
    { value: "overdue", label: "En retard", icon: AlertTriangle },
  ];

  const PRIORITY_OPTIONS = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Haute" },
  ];

  /* ============================= */
  /* Render */
  /* ============================= */

  return (
    <div className="w-full">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Label>Statut</Label>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(val) =>
                onFilterChange("status", val === "all" ? undefined : val)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Label>Priorité</Label>
            <Select
              value={filters.priority ?? "all"}
              onValueChange={(val) =>
                onFilterChange("priority", val === "all" ? undefined : val)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {PRIORITY_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions groupées ({selectedCount})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>

                {onSetSelectedPending && (
                  <DropdownMenuItem
                    onClick={() => onSetSelectedPending(selectedIds)}
                  >
                    Passer en attente
                  </DropdownMenuItem>
                )}

                {onSetSelectedInProgress && (
                  <DropdownMenuItem
                    onClick={() => onSetSelectedInProgress(selectedIds)}
                  >
                    Passer en cours
                  </DropdownMenuItem>
                )}

                {onSetSelectedDone && (
                  <DropdownMenuItem
                    onClick={() => onSetSelectedDone(selectedIds)}
                  >
                    Passer terminé
                  </DropdownMenuItem>
                )}

              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onAddClick && (
            <Button size="sm" onClick={onAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une tâche
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(group => (
              <TableRow key={group.id}>
                {group.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center h-24" colSpan={columns.length}>
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
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
    </div>
  );
}