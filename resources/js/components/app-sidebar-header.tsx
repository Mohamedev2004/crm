/* eslint-disable import/order */
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';

import { getMainNavItems } from '@/components/app-sidebar'; // ✅ import the function
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NativeDialog, NativeDialogContent, NativeDialogHeader, NativeDialogTitle } from './native-dialog';
import { AppLatestNotifications } from './app-latest-notifications';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [open, setOpen] = useState(false);

    const { props } = usePage<{ unreadNotificationsCount: number }>();
    const unreadCount = props.unreadNotificationsCount || 0;

    const mainNavItems = getMainNavItems(unreadCount); // ✅ get nav items dynamically

    /* -----------------------------
       Ctrl + K shortcut
    -------------------------------- */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

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
                    {/* Search Trigger */}
                    <div
                        onClick={() => setOpen(true)}
                        className="hidden lg:flex h-9 w-[280px] cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:bg-accent"
                    >
                        <Search className="h-4 w-4" />
                        <span className="flex-1">Search...</span>
                        <kbd className="flex items-center justify-center h-6 px-2 rounded border bg-muted font-mono text-sm">
                            ⌘ K
                        </kbd>
                    </div>
                    {/* Notifications */}
                    <AppLatestNotifications />
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

                        <CommandGroup heading="Pages" className="!bg-transparent">
                            {mainNavItems.flatMap(group => group.items).map(item => {
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