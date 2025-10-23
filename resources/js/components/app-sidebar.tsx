import { NavFooter } from '@/components/nav-footer'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { dashboard } from '@/routes'
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import { BookOpen, Folder, LayoutGrid, Users, ShoppingBag, SquareKanban, ChartBar, UserCheck, CreditCard, CircleDollarSign, ArrowDownUp, TrendingUpDown, Calendar } from 'lucide-react'
import AppLogo from './app-logo'

interface AppSidebarProps {
  user: {
    role: 'admin' | 'commercial' | 'client'
    name?: string
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const navGroupsByRole: Record<
    string,
    { label: string; items: NavItem[] }[]
  > = {
    admin: [
      {
        label: 'Platform',
        items: [
          { title: 'Analytics', href: dashboard(), icon: ChartBar },
          { title: 'Finance', href: '', icon: CreditCard },
        ],
      },
      {
        label: 'Users',
        items: [
          { title: 'Clients', href: '/admin/clients', icon: UserCheck },
          { title: 'Commercials', href: '/admin/commercials', icon: Users },
        ],
      },
      {
        label: 'Data',
        items: [
          { title: 'Leads', href: '/admin/leads', icon: ArrowDownUp },
          { title: 'Deals', href: '/admin/deals', icon: ShoppingBag },
          { title: 'Revenues', href: '/admin/revenues', icon: CircleDollarSign },
        ],
      },
      {
        label: 'Personal',
        items: [
          { title: 'Kanban', href: '/admin/tasks', icon: SquareKanban },
          { title: 'Calendar', href: '/admin/appointments', icon: Calendar },
          { title: 'Transactions', href: '/admin/transactions', icon: TrendingUpDown },
          { title: 'Invoices', href: '/admin/invoices', icon: Folder },
        ],
      },
    ],
    commercial: [
      {
        label: 'Platform',
        items: [
          { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
          { title: 'Deals', href: '/commercial/deals', icon: Folder },
        ],
      },
      {
        label: 'Users',
        items: [{ title: 'My Clients', href: '/commercial/clients', icon: Users }],
      },
    ],
    client: [
      {
        label: 'Platform',
        items: [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }],
      },
    ],
  }

  const navGroups = navGroupsByRole[user.role] || []

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
  ]

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
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
