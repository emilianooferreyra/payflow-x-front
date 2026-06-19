"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowRightSLine, RiArrowUpLine, RiCheckboxCircleLine } from "@remixicon/react"
import { formatCurrency } from "@/lib/utils"

interface BalanceCardProps {
  balance: number
  isLoading: boolean
  kycApproved?: boolean
}

export function BalanceCard({ balance, isLoading, kycApproved }: BalanceCardProps) {
  const intPart = formatCurrency(balance).replace(/\.\d+$/, "")
  const decPart = formatCurrency(balance).match(/\.(\d+)$/)?.[1] ?? "00"

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Badge
            variant="secondary"
            className="rounded-full px-3.5 py-1 text-xs font-semibold border-0"
          >
            USD Digital
          </Badge>
          {kycApproved && (
            <div className="flex items-center gap-1.5 text-xs text-positive font-semibold">
              <RiCheckboxCircleLine className="size-3.5" />
              Verificada
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-72" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                {intPart}
              </span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                .{decPart}
              </span>
              <Badge className="ml-2 bg-positive/10 text-positive border-0 gap-1 text-xs font-bold rounded-full px-2.5 py-1">
                <RiArrowUpLine className="size-3" />
                 3.65% TNA
              </Badge>
            </div>
            <Link
              href="/wallet"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Ver información de la cuenta
              <RiArrowRightSLine className="size-4" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
