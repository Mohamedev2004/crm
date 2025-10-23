import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Users, UserPlus, Handshake, DollarSign } from "lucide-react";
import { LeadsBySourceChart } from "@/components/LeadsBySourceChart";
import { StatCard } from "@/components/StatCard";
import { UpcomingTasks } from "@/components/UpcomingTasks";
import { SalesPipeline } from "@/components/SalesPipeline"; // <- import it
import AppointmentCalendar from "@/components/AppointmentCalendar";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Platform',
        href: route('dashboard'),
    },
    {
        title: 'Analytics',
        href: '/dashboard',
    },
];

interface PipelineStageData {
  stage: string;
  deals: number;
  value: number;
}

interface DashboardProps {
  auth: {
    user: {
      role: "admin" | "client" | "commercial";
      name: string;
    };
  };
  stats: {
    totals: {
      clients: number;
      leads: number;
      deals: number;
      revenues: number;
    };
    changes: {
      clients: number;
      leads: number;
      deals: number;
      revenues: number;
    };
  };
  charts: {
    leadsBySource: Record<string, number>;
  };
  tasks: {
    id: number;
    title: string;
    description?: string;
    due_date: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "in_progress" | "done" | "cancelled";
  }[];
  salesPipeline: PipelineStageData[];
}

export default function Dashboard({ auth, stats, charts, tasks, salesPipeline }: DashboardProps) {
  const cards = [
    {
      title: "Total Customers",
      value: stats.totals.clients,
      change: stats.changes.clients,
      icon: <Users className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />,
    },
    {
      title: "Total Leads",
      value: stats.totals.leads,
      change: stats.changes.leads,
      icon: <UserPlus className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />,
    },
    {
      title: "Total Deals",
      value: stats.totals.deals.toLocaleString(),
      change: stats.changes.deals,
      icon: <Handshake className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totals.revenues.toLocaleString()}`,
      change: stats.changes.revenues,
      icon: <DollarSign className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-4 p-6 min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
        <h1 className="text-2xl font-semibold">CRM Dashboard</h1>

        {/* --- Stats Cards --- */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              change={card.change}
              icon={card.icon}
            />
          ))}
        </div>

        {/* --- Main Dashboard Grid --- */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {/* Leads Chart */}
          <div className="flex flex-col h-full min-h-[300px]">
            <LeadsBySourceChart data={charts.leadsBySource} />
          </div>

          {/* Upcoming Tasks */}
          <div className="flex flex-col h-full min-h-[300px]">
            <UpcomingTasks tasks={tasks} viewAllLink={route("admin.tasks")} />
          </div>

          {/* Sales Pipeline */}
          <div className="flex flex-col h-full min-h-[300px]">
            <SalesPipeline rawPipeline={salesPipeline} />
          </div>

          {/* Appointment Calendar */}
          <div className="flex flex-col h-full min-h-[300px]">
            <AppointmentCalendar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
