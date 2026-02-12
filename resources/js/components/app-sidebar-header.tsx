/* eslint-disable import/order */
import { useEffect, useState } from 'react';
import { Search, Bell, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
} from 'lucide-react';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { mainNavItems } from '@/components/app-sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Badge } from './ui/badge';
import { NativeDialog, NativeDialogContent, NativeDialogHeader, NativeDialogTitle } from './native-dialog';

/* -----------------------------
   Types
-------------------------------- */
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    time: string;
}

/* -----------------------------
   Mock notifications data
-------------------------------- */
const notifications: Notification[] = [
    {
        id: 1,
        message: 'Order placed successfully',
        type: 'success',
        time: '2 days ago',
    },
    {
        id: 2,
        message: 'Payment failed',
        type: 'error',
        time: '11 am',
    },
    {
        id: 3,
        message: 'New login detected',
        type: 'info',
        time: '12 pm',
    },
    {
        id: 4,
        message: 'Memory usage is high',
        type: 'warning',
        time: '12 pm',
    },
];

const notificationConfig = {
    success: {
        icon: CheckCircle2,
        color: 'text-green-600',
        bg: 'bg-green-500/10',
        badgetext: 'text-green-600',
    },
    error: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-500/10',
        badgetext: 'text-red-600',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bg: 'bg-yellow-500/10',
        badgetext: 'text-yellow-600',
    },
    info: {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-500/10',
        badgetext: 'text-blue-600',
    },
};



export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [open, setOpen] = useState(false);

    /* -----------------------------
       Ctrl + K shortcut
    -------------------------------- */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;

            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, []);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 md:px-4 ">
                {/* Left */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative cursor-pointer border "
                            >
                                <Bell className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-96 p-0 shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <span className="text-sm font-semibold">Notifications</span>
                                <Button variant='link' size='xs' className="text-xs cursor-pointer">
                                    View all
                                </Button>
                            </div>

                            {/* List */}
                            <div className="max-h-[360px] overflow-visible flex flex-col gap-1 relative">
                                {notifications.map((n) => {
                                    const config = notificationConfig[n.type];
                                    const Icon = config.icon;

                                    return (
                                    <div
                                        key={n.id}
                                        className={`
                                        group relative flex gap-3 px-4 py-3 text-sm bg-card rounded-md shadow-md
                                        transform transition-all duration-300 ease-out
                                        hover:scale-108 hover:rotate-2 hover:shadow-2xl hover:z-50
                                        origin-center
                                        `}
                                        style={{
                                        transformOrigin: 'center',
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${config.bg}`}>
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden">
                                        <p className="font-medium text-foreground leading-tight truncate">
                                            {n.message}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Badge
                                            variant="outline"
                                            className={`capitalize ${config.badgetext} mr-2`}
                                            >
                                            {n.type}
                                            </Badge>
                                            <Clock className="h-3 w-3" />
                                            <span>{n.time}</span>
                                        </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Search Trigger */}
                    <div
                        onClick={() => setOpen(true)}
                        className="hidden md:flex h-9 w-[280px] cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:bg-accent"
                    >
                        <Search className="h-4 w-4" />
                        <span className="flex-1">Search...</span>
                        <kbd className="flex items-center justify-center h-6 px-2 rounded border bg-muted font-mono text-sm">
                            ⌘ K
                        </kbd>
                    </div>
                </div>
            </header>

            {/* Search Dialog */}
            <NativeDialog open={open} onOpenChange={setOpen}>
                <NativeDialogContent className="p-0 sm:max-w-[480px]">
                    <NativeDialogHeader className="px-4 pt-4">
                    <NativeDialogTitle>Search Pages</NativeDialogTitle>
                    </NativeDialogHeader>

                    <Command>
                    <CommandInput placeholder="Type a page name..." />
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Pages" className='!bg-transparent'>
                        {mainNavItems.flatMap((group) => group.items).map((item) => {
                        const Icon = item.icon;

                        return (
                            <CommandItem
                            key={item.title}
                            onSelect={() => {
                                setOpen(false);
                                router.visit(item.href);
                            }}
                            className="flex items-center gap-2"
                            >
                            {Icon && <Icon className="h-4 w-4" />}
                            {item.title}
                            </CommandItem>
                        );
                        })}
                    </CommandGroup>
                    </Command>
                </NativeDialogContent>
            </NativeDialog>
        </>
    );
}
