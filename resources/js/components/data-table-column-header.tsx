/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/order */
import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column?: Column<TData, TValue>
  title: string
  columnId: string
  currentSortBy?: string
  currentSortDir?: "asc" | "desc"
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  columnId,
  currentSortBy,
  currentSortDir,
  onSortChange,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSortedAsc = currentSortBy === columnId && currentSortDir === "asc"
  const isSortedDesc = currentSortBy === columnId && currentSortDir === "desc"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8">
            <span>{title}</span>
            {isSortedDesc ? <ArrowDown /> : isSortedAsc ? <ArrowUp /> : <ChevronsUpDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onSortChange?.(columnId, "asc")}>
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange?.(columnId, "desc")}>
            <ArrowDown />
            Desc
          </DropdownMenuItem>
          {column && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
