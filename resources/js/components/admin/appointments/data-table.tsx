"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
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
} from "@tanstack/react-table"



import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/data-table-pagination"
import { DataTableViewOptions } from "../../data-table-view-options"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, CircleCheck, CircleX, Timer } from "lucide-react"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // --- NEW PROPS FOR ROW SELECTION ---
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function DataTable<TData, TValue>({
  columns,
  data= [],
  rowSelection,
  setRowSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  // --- REMOVED THE LOCAL STATE FOR ROW SELECTION ---

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    // --- NOW USING THE PASSED-IN PROP FOR ROW SELECTION ---
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      {/* Top Filters & View Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2 py-4"> 
          {/* Filters: Search + Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto flex-wrap">
              {/* Search */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                  <Label htmlFor="Search" className="whitespace-nowrap">Search</Label>
                  <Input
                    placeholder="Search appointment's name..."
                    value={(table.getColumn("appointment_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("appointment_name")?.setFilterValue(event.target.value)
                    }
                    className="w-full sm:w-64"
                  />
              </div>

              {/* Status Filter */}
              <div className="flex flex-col space-x-2 sm:flex-row items-start sm:items-center gap-2 sm:gap-1 min-w-[180px]">
                  <Label htmlFor="status_filter" className="whitespace-nowrap">Filter by Status</Label>
                  <Select
                      onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
                      value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                  >
                      <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Pending"> <span><Timer/></span> Pending</SelectItem>
                          <SelectItem value="Cancelled"> <span><CircleX/></span> Cancelled</SelectItem>
                          <SelectItem value="Confirmed"> <span><CircleCheck/></span> Confirmed</SelectItem>
                          <SelectItem value="Completed"> <span><CheckSquare/></span> Completed</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          {/* Table View Options */}
          <div className="flex justify-start md:justify-end w-full md:w-auto">
              <DataTableViewOptions table={table} />
          </div>
      </div>

      <div className="text-muted-foreground flex-1 mb-2 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div  className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
