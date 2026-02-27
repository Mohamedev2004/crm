import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    SquareKanban,
    LayoutDashboard,
    ListChecks,
    Users,
    CalendarCheck2,
    Bell,
    MailPlus,
    FolderClock,
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

/**
 * Exported nav items so they can be imported elsewhere if needed
 */
export function getMainNavItems(unreadCount: number): NavGroup[] {
    return [
        {
            label: 'Application',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutDashboard,
                },
                {
                    title: 'Notifications',
                    href: '/admin/notifications',
                    icon: Bell,
                    badge: unreadCount,
                },
            ],
        },
        {
            label: 'Crm Tools',
            items: [
                {
                    title: 'Patients',
                    href: '/admin/patients',
                    icon: Users,
                },
                {
                    title: 'Newsletters',
                    href: '/admin/newsletters',
                    icon: MailPlus,
                },
                {
                    title: 'Tâches',
                    href: '/admin/tasks',
                    icon: ListChecks,
                },
                {
                    title: 'Kanban',
                    href: '/admin/kanban',
                    icon: SquareKanban,
                },
                {
                    title: 'Rendez-vous',
                    href: '/admin/appointments',
                    icon: FolderClock,
                },
                {
                    title: 'Calendrier',
                    href: '/admin/calendar',
                    icon: CalendarCheck2,
                },
            ],
        },
        {
            label: 'Pages',
            items: [
                {
                    title: 'Call to Action',
                    href: '/admin/cta',
                    icon: Bell,
                },
            ],
        },
    ];
}

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
    const { props } = usePage<{ unreadNotificationsCount: number }>();
    const unreadCount = props.unreadNotificationsCount || 0;

    const mainNavItems = getMainNavItems(unreadCount);

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