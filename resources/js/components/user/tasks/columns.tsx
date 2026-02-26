import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen } from 'lucide-react';

export interface Task {
    id: number;
    title: string;
    description: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'done' | 'overdue';
    patient_id: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const createTaskColumns = (
    onUpdate: (task: Task) => void,
    onSetPending: (task: Task) => void,
    onSetInProgress: (task: Task) => void,
    onSetDone: (task: Task) => void,
    currentSortBy?: string,
    currentSortDir?: 'asc' | 'desc',
    onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void,
): ColumnDef<Task>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                disabled={table.getRowModel().rows.every((row) => !row.getCanSelect())}
                aria-label="Tout sélectionner"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                disabled={!row.getCanSelect()}
                aria-label="Sélectionner la ligne"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: 'id',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="ID"
                columnId="id"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
    },

    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Titre"
                columnId="title"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const value = row.getValue('title') as string;
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
    },

    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Description"
                columnId="description"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const value = row.getValue('description') as string;
            if (!value) return <span className="text-muted-foreground italic">Pas de description</span>;
            return value.length > 30 ? value.substring(0, 30) + '...' : value;
        },
    },

    {
        id: 'patient',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Patient"
                columnId="patient_id"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const task = row.original;
            if (!task.patient) return <span className="text-muted-foreground italic">Aucun</span>;
            return `${task.patient.first_name} ${task.patient.last_name}`;
        },
    },

    {
        accessorKey: 'due_date',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Date limite"
                columnId="due_date"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue('due_date'));
            return date.toLocaleDateString();
        },
    },

    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Statut"
                columnId="status"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const task = row.original;

            const statusMap: Record<
                Task['status'],
                'success' | 'pending' | 'destructive' | 'in_progress'
            > = {
                done: 'success',
                pending: 'pending',
                in_progress: 'in_progress',
                overdue: 'destructive',
            };

            const labelMap: Record<Task['status'], string> = {
                done: 'Terminé',
                pending: 'En attente',
                in_progress: 'En cours',
                overdue: 'En retard',
            };

            return (
                <Badge className="capitalize" variant={statusMap[task.status]}>
                    {labelMap[task.status]}
                </Badge>
            );
        },
    },

    {
        accessorKey: 'priority',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Priorité"
                columnId="priority"
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                onSortChange={onSortChange}
            />
        ),
        cell: ({ row }) => {
            const task = row.original;

            const priorityMap: Record<Task['priority'], 'low' | 'medium' | 'high'> = {
                low: 'low',
                medium: 'medium',
                high: 'high',
            };

            const labelMap: Record<Task['priority'], string> = {
                low: 'Faible',
                medium: 'Moyenne',
                high: 'Haute',
            };

            return (
                <Badge className="capitalize" variant={priorityMap[task.priority]}>
                    {labelMap[task.priority]}
                </Badge>
            );
        },
    },

    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const task = row.original;
            const isDone = task.status === 'done';

            return (
                <>
                    {!isDone && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onUpdate(task)}
                                >
                                    <SquarePen className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onSetPending(task)}
                                >
                                    En attente
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onSetInProgress(task)}
                                >
                                    En cours
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onSetDone(task)}
                                >
                                    Terminé
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </>
            );
        },
    },
];