"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowRightSLine, RiArrowDownBoxLine, RiArrowUpBoxLine, RiExchange2Line } from "@remixicon/react"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "@/lib/api/transactions"

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading: boolean
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Recent transactions</h2>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
        >
          View all
          <RiArrowRightSLine className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border">
              <Skeleton className="size-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-32 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <Card className="border">
          <CardContent className="flex flex-col items-center py-10">
            <RiArrowDownBoxLine className="size-8 text-muted mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border divide-y">
          {transactions.map((tx) => {
            const isDeposit = tx.type === "DEPOSIT"
            const isWithdraw = tx.type === "WITHDRAWAL"
            const isExchange = tx.type === "EXCHANGE"
            const sign = isDeposit || isExchange ? "+" : "-"
            const color = isDeposit ? "text-positive" : isWithdraw ? "text-destructive" : "text-primary"
            const bgColor = isDeposit ? "bg-positive/10" : isWithdraw ? "bg-destructive/10" : "bg-primary/10"
            const Icon = isDeposit ? RiArrowDownBoxLine : isWithdraw ? RiArrowUpBoxLine : RiExchange2Line
            const label = isDeposit ? "Deposit" : isWithdraw ? "Withdrawal" : isExchange ? "Exchange" : tx.type

            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`flex size-9 items-center justify-center rounded-xl ${bgColor}`}>
                  <Icon className={`size-4.5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description || label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold tabular-nums ${color}`}>
                    {sign}{formatCurrency(Number(tx.amount))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{tx.currency}</p>
                </div>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
