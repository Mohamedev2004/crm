"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface IncomeSourceData {
  stage: string
  deals: number
  value: number
  trend?: number | null
}

interface IncomeBySourceProps {
  rawData: IncomeSourceData[]
}

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export const IncomeBySource: React.FC<IncomeBySourceProps> = ({ rawData }) => {
  const [isDark, setIsDark] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const darkMode = document.documentElement.classList.contains("dark")
    setIsDark(darkMode)

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const processedData = React.useMemo(() => {
    if (isDark === null) return []

    const chartColorsLight = ["#888888", "#9ca3af", "#6d6d6d", "#4b5563"]
    const chartColorsDark = ["#ffffff", "#d1d5db", "#9ca3af", "#6b7280"]
    const colors = isDark ? chartColorsDark : chartColorsLight

    const totalDeals = rawData.reduce((sum, item) => sum + item.deals, 0)

    return rawData.map((item, index) => ({
      ...item,
      displayName:
        item.stage.charAt(0).toUpperCase() +
        item.stage.slice(1).replace(/_/g, " "),
      percentage: totalDeals > 0 ? Math.round((item.deals / totalDeals) * 100) : 0,
      color: colors[index % colors.length],
    }))
  }, [rawData, isDark])

  if (isDark === null) return null

  const totalDeals = processedData.reduce((sum, stage) => sum + stage.deals, 0)

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="pb-4">
        <CardTitle>Income by Source</CardTitle>
        <CardDescription>Breakdown of income from all sources</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Top stacked progress bar */}
        <div className="flex w-full h-3 mb-8 rounded-sm overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          {processedData.map((stage) => {
            const widthPercent =
              totalDeals > 0
                ? Math.max((stage.deals / totalDeals) * 100, 2)
                : 100 / processedData.length
            return (
              <div
                key={stage.stage}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: stage.color,
                  opacity: stage.deals === 0 ? 0.5 : 1,
                }}
                title={`${stage.displayName}: ${stage.deals} deals`}
              />
            )
          })}
        </div>

        {/* Detail list */}
        <div className="flex flex-col gap-5">
          {processedData.map((stage) => (
            <div
              key={stage.stage}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-start space-x-3 w-1/2">
                <span
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <div>
                  <p className="font-medium text-sm text-black dark:text-white">
                    {stage.displayName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {stage.deals ?? 0} deals · {formatCurrency(stage.value ?? 0)}
                    {stage.trend != null && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          stage.trend > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        ({stage.trend > 0 ? "▲" : "▼"} {Math.abs(stage.trend)})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center w-1/2 space-x-3">
                <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalDeals > 0 ? Math.max(stage.percentage, 2) : 2
                      }%`,
                      backgroundColor: stage.color,
                      opacity: stage.deals === 0 ? 0.5 : 1,
                    }}
                  />
                </div>
                <span className="w-10 text-right font-medium text-sm text-black dark:text-white">
                  {stage.percentage ?? 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
