/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Pie, PieChart, Label } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"


interface ExpenseCategory {
  category: string
  total: number
  count: number
}

interface ExpensesByCategoryProps {
  data: ExpenseCategory[]
}

export function ExpensesByCategory({ data }: ExpensesByCategoryProps) {
  const [isDark, setIsDark] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const darkMode = document.documentElement.classList.contains("dark")
    setIsDark(darkMode)

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const totalExpenses = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.total, 0)
  }, [data])

  const chartData = React.useMemo(() => {
    if (isDark === null) return []

    const chartColorsLight = ["#dfe2e6", "#9ca3af", "#4b5563", "#111827"]
    const chartColorsDark = ["#ffffff", "#d1d5db", "#6b7280", "#5b616e"]

    const colors = isDark ? chartColorsDark : chartColorsLight

    return data.map((item, index) => ({
      category: item.category.replace("_", " "),
      total: item.total,
      count: item.count,
      fill: colors[index % colors.length],
    }))
  }, [data, isDark])

  const chartConfig: ChartConfig = {}

  if (isDark === null) return null

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Distribution of expenses</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
            cursor={false}
            content={({ active, payload }: any) => {
                if (!active || !payload || !payload.length) return null
                const data = payload[0].payload
                return (
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md p-2 shadow-md text-sm">
                    <div className="font-semibold text-gray-900 capitalize dark:text-white">{data.category}</div>
                    <div className="flex justify-between mt-1">
                    <span className="text-gray-600 dark:text-gray-300">Transactions:</span>
                    <span className="font-medium">{data.count}</span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                    <span className="text-gray-600 dark:text-gray-300">Total:</span>
                    <span className="font-medium">${data.total.toLocaleString()}</span>
                    </div>
                </div>
                )
            }}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox && "cy" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalExpenses.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Total
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend / Key */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.fill }}></span>
              <span>{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
