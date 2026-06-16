"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils"

interface DataPoint {
  month: string
  earnings: number
}

interface EarningsChartProps {
  data: DataPoint[]
  isLoading: boolean
}

export function EarningsChart({ data, isLoading }: EarningsChartProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Earnings overview</CardTitle>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-0"
          >
            3 months
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-52 w-full rounded-xl" />
        ) : data.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No earnings data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                dx={-4}
                tickFormatter={formatCurrencyCompact}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(v) => [formatCurrency(Number(v)), "Accumulated earnings"]}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#earningsGradient)"
                dot={{ fill: "var(--primary)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "var(--primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
