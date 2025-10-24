"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpenseData {
  month: string;
  count: number;
  total: number;
  year?: number;
}

interface MonthlyExpensesChartProps {
  data: ExpenseData[];
  availableYears: number[];
  defaultYear: number;
}

export function MonthlyExpensesChart({ data, availableYears, defaultYear }: MonthlyExpensesChartProps) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // ✅ Filter by selected year dynamically
  const filteredData = useMemo(
    () => data.filter((d) => (d.year || defaultYear) === selectedYear),
    [data, selectedYear, defaultYear]
  );

  const chartConfig = {
    count: { label: "Expenses" },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="">
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Expense overview for {selectedYear}</CardDescription>
        <div className="flex justify-end">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
          <SelectTrigger className="w-[120px] mt-2 sm:mt-0">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => {
                    const entry = payload?.[0]?.payload;
                    const total = entry?.total ?? 0;
                    return `${label} — ${total.toFixed(2)} $ total`;
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--sidebar-foreground)"
              strokeWidth={2}
              radius={8}
              activeBar={({ ...props }) => (
                <Rectangle
                  {...props}
                  fillOpacity={0.8}
                  stroke="var(--sidebar-foreground)"
                  strokeDasharray={4}
                  strokeDashoffset={4}
                />
              )}
            />
          </BarChart>
        </ChartContainer>

        {filteredData.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            No data available for {selectedYear}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
