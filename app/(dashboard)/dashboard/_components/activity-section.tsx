"use client"

import Link from "next/link"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"
import { RiArrowRightSLine, RiArrowDownLine, RiArrowRightUpLine } from "@remixicon/react"

export function ActivitySection() {
  const { data: recentTxns } = useSuspenseQuery({
    queryKey: ["transactions", 1, "", ""],
    queryFn: () => getTransactions({ page: 1, limit: 5 }),
  })

  if (recentTxns.data.length === 0) {
    return <p className="text-sm text-[#666666] py-6 text-center">Sin actividad aún.</p>
  }

  return (
    <div className="space-y-0.5">
      {recentTxns.data.slice(0, 5).map((tx) => {
        const isInflow = tx.type === "DEPOSIT" || tx.type === "YIELD"
        return (
          <Link
            key={tx.id}
            href="/transacciones"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F5F5F5] transition-colors -mx-3"
          >
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isInflow ? "bg-[#111111]/10" : "bg-[#E5484D]/10"
              }`}>
              {isInflow ? (
                <RiArrowDownLine className="size-3.5 text-[#111111]" />
              ) : (
                <RiArrowRightUpLine className="size-3.5 text-[#E5484D]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">
                {tx.description || tx.type}
              </p>
              <p className="text-xs text-[#666666]">
                {new Date(tx.createdAt).toLocaleDateString("es-AR", {
                  month: "short", day: "numeric",
                })}
              </p>
            </div>
            <p className={`text-sm font-semibold tabular-nums ${isInflow ? "text-[#111111]" : "text-[#111111]"
              }`}>
              {isInflow ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
