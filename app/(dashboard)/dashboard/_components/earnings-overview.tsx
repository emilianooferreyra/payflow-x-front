"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RiCalendar2Line } from "@remixicon/react"
import { formatCurrency } from "@/lib/utils"

interface EarningsOverviewProps {
  apy: number
  totalYield: number
  thisMonthYield: number
  isLoading: boolean
}

export function EarningsOverview({ apy, totalYield, thisMonthYield, isLoading }: EarningsOverviewProps) {
  const items = [
    {
      icon: <span className="text-xl font-bold text-primary leading-none">%</span>,
      label: "Tasa anual",
      value: `${apy}%`,
    },
    {
      icon: <span className="text-xl font-bold text-primary leading-none">$</span>,
      label: "Ganado total",
      value: formatCurrency(totalYield),
    },
    {
      icon: <RiCalendar2Line className="size-5 text-primary" />,
      label: "Ganado este mes",
      value: formatCurrency(thisMonthYield),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="flex items-center gap-4 px-4 py-5">
                <Skeleton className="size-12 rounded-xl shrink-0" />
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        : items.map((item) => (
            <Card key={item.label} className="border">
              <CardContent className="flex items-center gap-4 px-4 py-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  )
}
