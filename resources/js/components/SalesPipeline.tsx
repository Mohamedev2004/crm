"use client"

import { type FC, useMemo, useState, useEffect } from "react"

interface PipelineStageData {
  stage: string
  deals: number
  value: number
}

interface SalesPipelineProps {
  rawPipeline: PipelineStageData[]
}

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export const SalesPipeline: FC<SalesPipelineProps> = ({ rawPipeline }) => {
  const [isDark, setIsDark] = useState<boolean | null>(
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkMode = document.documentElement.classList.contains("dark")
      setIsDark(prev => (prev !== darkMode ? darkMode : prev))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const processedPipeline = useMemo(() => {
    if (isDark === null) return []

    const chartColorsLight = ["#888888", "#9ca3af", "#6d6d6d", "#4b5563", "#111827"]
    const chartColorsDark = ["#ffffff", "#d1d5db", "#9ca3af", "#6b7280", "#5b616e"]
    const colors = isDark ? chartColorsDark : chartColorsLight

    const totalDeals = rawPipeline.reduce((sum, item) => sum + item.deals, 0)

    return rawPipeline.map((item, index) => ({
      ...item,
      displayName:
        item.stage.charAt(0).toUpperCase() + item.stage.slice(1).replace(/_/g, " "),
      percentage:
        totalDeals > 0 ? Math.round((item.deals / totalDeals) * 100) : 0,
      color: colors[index % colors.length],
    }))
  }, [rawPipeline, isDark])

  if (isDark === null) return null

  const totalDeals = processedPipeline.reduce((sum, stage) => sum + stage.deals, 0)

  return (
    <div className="shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-black dark:text-white">Sales Pipeline</h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
        Current deals in your sales pipeline.
      </p>

      {/* ✅ Always render all segments, even when totalDeals = 0 */}
      <div className="flex w-full h-3 mb-8 rounded-sm overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {processedPipeline.map(stage => {
          // Always give a small width (e.g. 5%) if totalDeals = 0
          const widthPercent =
            totalDeals > 0
              ? Math.max((stage.deals / totalDeals) * 100, 2)
              : 100 / processedPipeline.length

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

      {/* ✅ Always show all stages in the list */}
      <div className="flex flex-col gap-5">
        {processedPipeline.map(stage => (
          <div key={stage.stage} className="flex items-center justify-between">
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
                  {stage.deals ?? 0} deals &middot; {formatCurrency(stage.value ?? 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center w-1/2 space-x-3">
              <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalDeals > 0
                        ? Math.max(stage.percentage, 2)
                        : 2 // ✅ always visible small bar
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
    </div>
  )
}
