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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface LeadsBySourceChartProps {
  data: Record<string, number>
}

export function LeadsBySourceChart({ data }: LeadsBySourceChartProps) {
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

  const totalLeads = Object.values(data).reduce((a, b) => a + b, 0)

  const chartData = React.useMemo(() => {
    if (isDark === null) return []

    const chartColorsLight = ["#dfe2e6", "#9ca3af", "#4b5563", "#111827"]
    const chartColorsDark = ["#ffffff", "#d1d5db", "#6b7280", "#5b616e"]

    const colors = isDark ? chartColorsDark : chartColorsLight

    return Object.entries(data).map(([source, total], index) => ({
      source,
      total,
      fill: colors[index % colors.length],
    }))
  }, [data, isDark])

  const chartConfig: ChartConfig = {}

  if (isDark === null) return null

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="items-center pb-0">
        <CardTitle>Leads by Source</CardTitle>
        <CardDescription>Distribution of lead origins</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="total" nameKey="source" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox && "cy" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                        {totalLeads}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                        Leads
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
            <div key={item.source} className="flex items-center gap-2 text-sm">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: item.fill }}
              ></span>
              <span>{item.source}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
