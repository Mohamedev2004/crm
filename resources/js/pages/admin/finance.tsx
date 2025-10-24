import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { FinanceCard } from "@/components/FinanceCard";
import { ArrowUp, ArrowDown } from "lucide-react";
import { IncomeBySource } from "@/components/IncomeBySource";
import { MonthlyExpensesChart } from "@/components/MonthlyExpensesChart";
import { ExpensesByCategory } from "@/components/ExpensesByCategory"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Platform", href: route("finance") },
  { title: "Finance", href: "/dashboard" },
];

interface ExpenseCategory {
  category: string;
  total: number;
  count: number; // ✅ required by ExpensesByCategory
}

interface DashboardProps {
  auth: { user: { id: number; role: "admin" | "client" | "commercial"; name: string } };
  totals: { balance: number; income: number; expenses: number; paidInvoices: number };
  trends: { balance: number | null; income: number | null; expenses: number | null; paidInvoices: number | null };
  incomeBySource: { stage: string; deals: number; value: number; trend?: number | null }[];
  monthlyExpenses: { month: string; count: number; total: number; year?: number }[];
  expensesByCategory: ExpenseCategory[]; // ✅ updated type
  availableYears: number[];
  selectedYear: number;
}

export default function Finance({
  auth,
  totals,
  trends,
  incomeBySource,
  monthlyExpenses,
  availableYears,
  selectedYear,
  expensesByCategory,
}: DashboardProps) {
  const { user } = auth;

  const cards = [
    {
      title: "Balance",
      value: `$${totals.balance.toFixed(2)}`,
      change: trends.balance,
      icon: trends.balance !== null ? (trends.balance >= 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />) : null,
    },
    {
      title: "Total Income",
      value: `$${totals.income.toFixed(2)}`,
      change: trends.income,
      icon: trends.income !== null ? (trends.income >= 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />) : null,
    },
    {
      title: "Expenses",
      value: `$${totals.expenses.toFixed(2)}`,
      change: trends.expenses,
      icon: trends.expenses !== null ? (trends.expenses >= 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />) : null,
    },
    {
      title: "Paid Invoices",
      value: totals.paidInvoices,
      change: trends.paidInvoices,
      icon: trends.paidInvoices !== null ? (trends.paidInvoices >= 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />) : null,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={user}>
      <Head title="Finance" />
      <div className="flex flex-col gap-4 p-6 min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
        <h1 className="text-2xl font-semibold">Finance Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => (
            <FinanceCard key={card.title} title={card.title} value={card.value} change={card.change ?? 0} icon={card.icon} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="flex flex-col h-full min-h-[300px]">
            <IncomeBySource rawData={incomeBySource} />
          </div>

          <div className="flex flex-col h-full min-h-[300px]">
            <MonthlyExpensesChart
              data={monthlyExpenses}
              availableYears={availableYears}
              defaultYear={selectedYear}
            />
          </div>

          <div className="flex flex-col h-full min-h-[300px]">
            <ExpensesByCategory data={expensesByCategory} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
