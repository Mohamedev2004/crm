import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    SquareKanban,
    LayoutDashboard,
    ListChecks,
    Users,
    CalendarCheck2,
    Bell,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavGroup, NavItem } from '@/types';
import AppLogo from './app-logo';

export const mainNavItems: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: 'Applications',
        items: [
            {
                title: 'Tasks',
                href: 'admin/tasks',
                icon: ListChecks,
            },
            {
                title: 'Pipeline',
                href: 'admin/pipeline',
                icon: SquareKanban,
            },
            {
                title: 'Lists',
                href: 'admin/lists',
                icon: Users,
            },
            {
                title: 'Calendar',
                href: 'admin/calendar',
                icon: CalendarCheck2,
            },
        ],
    },
    {
        label: 'Pages',
        items: [
            {
                title: 'Notifications',
                href: 'admin/notifications',
                icon: Bell,
            },
        ],
    },
];


const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
