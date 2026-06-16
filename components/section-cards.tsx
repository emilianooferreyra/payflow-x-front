"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react"
import { getWallets } from "@/lib/api/wallet"
import { getPortfolio } from "@/lib/api/investments"

function fmt(amount: string | number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDT" ? "USD" : currency,
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32 mt-2" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-4 w-40" />
      </CardFooter>
    </Card>
  )
}

export function SectionCards() {
  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
    staleTime: 2 * 60_000,
  })

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
    staleTime: 5 * 60_000,
  })

  if (walletsLoading || portfolioLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  const usd = wallets?.find((w) => w.currency === "USD")
  const ars = wallets?.find((w) => w.currency === "ARS")
  const usdt = wallets?.find((w) => w.currency === "USDT")
  const pnl = portfolio?.summary
  const pnlPositive = (pnl?.totalPnL ?? 0) >= 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>USD Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usd ? fmt(usd.balance, "USD") : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">USD</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">US Dollar wallet</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>ARS Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {ars ? fmt(ars.balance, "ARS") : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">ARS</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Argentine Peso wallet</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>USDT Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {usdt ? fmt(usdt.balance, "USDT") : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">USDT</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Tether stablecoin wallet</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Portfolio P&L</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pnl ? fmt(pnl.totalValue, "USD") : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={pnlPositive ? "text-positive" : "text-destructive"}>
              {pnlPositive ? <RiArrowUpLine /> : <RiArrowDownLine />}
              {pnl ? `${pnlPositive ? "+" : ""}${pnl.totalPnLPercent}%` : "—"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={`font-medium ${pnlPositive ? "text-positive" : "text-destructive"}`}>
            {pnl ? `${pnlPositive ? "+" : ""}${fmt(pnl.totalPnL, "USD")} total P&L` : "—"}
          </div>
          <div className="text-muted-foreground">
            Cost basis {pnl ? fmt(pnl.totalCost, "USD") : "—"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
