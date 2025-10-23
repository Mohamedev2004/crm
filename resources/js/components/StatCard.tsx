import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import * as React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card className="bg-transparent border border-neutral-200 dark:border-neutral-800 p-4">
      <CardHeader className="flex justify-between items-center p-0">
        <CardTitle className="text-neutral-700 dark:text-neutral-400 text-sm font-medium">
          {title}
        </CardTitle>
        <div>{icon}</div>
      </CardHeader>
      <CardContent className="p-0 -mt-4">
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
      <CardFooter className="p-0 -mt-4">
        <span
          className={`text-sm font-medium ${
            change > 0
              ? "text-green-500 dark:text-green-400"
              : change < 0
              ? "text-red-500 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%
          <span className="text-neutral-500 dark:text-neutral-400"> from last month</span>
        </span>
      </CardFooter>
    </Card>
  );
}
