"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowDownCircleLine } from "@remixicon/react"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "@/lib/api/transactions"

interface RecentDepositsProps {
  transactions: Transaction[]
  isLoading: boolean
}

export function RecentDeposits({ transactions, isLoading }: RecentDepositsProps) {
  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-32 bg-[#F5F5F5]" />
              <Skeleton className="h-4 w-20 bg-[#F5F5F5]" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center">
          <RiArrowDownCircleLine className="mx-auto size-8 text-[#666666]/30 mb-2" />
          <p className="text-sm text-[#666666]">No deposits yet</p>
          <p className="text-xs text-[#666666] mt-1">
            Share your account details to receive your first deposit
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E5E5]">
          <div className="flex items-center justify-between pb-3 text-xs font-semibold text-[#666666] tracking-wide uppercase">
            <span>Sender</span>
            <div className="flex items-center gap-8">
              <span className="w-20 text-right">Amount</span>
              <span className="w-24 text-right">Date</span>
              <span className="w-20 text-right">Status</span>
            </div>
          </div>
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <p className="text-sm font-medium text-[#111111]">
                {tx.description || "Deposit"}
              </p>
              <div className="flex items-center gap-8">
                <p className="w-20 text-right text-sm font-semibold text-[#7C3AED]">
                  +{formatCurrency(tx.amount)}
                </p>
                <p className="w-24 text-right text-xs text-[#666666]">
                  {new Date(tx.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <span className="w-20 text-right text-[10px] font-medium text-[#7C3AED] uppercase">
                  {tx.status === "COMPLETED" ? "Completed" : tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
