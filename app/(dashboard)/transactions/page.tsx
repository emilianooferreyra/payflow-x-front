"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowLeftLine, RiArrowRightLine, RiArrowDownSLine, RiArrowUpLine, RiArrowDownLine } from "@remixicon/react"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"
import { TransactionTimeline } from "./_components/timeline"

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  EXCHANGE: "Exchange",
  INVESTMENT_BUY: "Investment",
  INVESTMENT_SELL: "Sale",
  YIELD: "Yield",
  TRANSFER: "Transfer",
}

const TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "bg-[#7C3AED]/10 text-[#7C3AED]",
  WITHDRAWAL: "bg-[#E5484D]/10 text-[#E5484D]",
  EXCHANGE: "bg-[#7C3AED]/10 text-[#7C3AED]",
  INVESTMENT_BUY: "bg-[#7C3AED]/10 text-[#7C3AED]",
  INVESTMENT_SELL: "bg-[#E5A500]/10 text-[#E5A500]",
  YIELD: "bg-[#22C55E]/10 text-[#22C55E]",
  TRANSFER: "bg-[#F5F5F5] text-[#666666]",
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
}

const TYPE_ICONS: Record<string, typeof RiArrowDownLine> = {
  DEPOSIT: RiArrowDownLine,
  WITHDRAWAL: RiArrowUpLine,
}

function getTypeIcon(type: string) {
  return TYPE_ICONS[type] ?? RiArrowDownLine
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [currency, setCurrency] = useState("")
  const [type, setType] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, currency, type],
    queryFn: () => getTransactions({
      page,
      limit: 20,
      ...(currency ? { currency } : {}),
      ...(type ? { type } : {}),
    }),
  })

  const totalPages = data?.meta.totalPages ?? 1

  function resetPage() { setPage(1) }

  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">

        {/* ─── Page Header ─── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              {data ? `${data.meta.total} transactions` : "Activity history"}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Transactions
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Your complete account activity.
          </p>
        </div>

        {/* ─── Filters ─── */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Select value={currency || "all"} onValueChange={(v) => { setCurrency(v === "all" ? "" : v); resetPage() }}>
            <SelectTrigger className="w-36 border-[#E5E5E5] rounded-xl h-12 px-4 text-base bg-white">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent sideOffset={8}>
              <SelectItem value="all" className="py-3">All currencies</SelectItem>
              <SelectItem value="USD" className="py-3">USD</SelectItem>
              <SelectItem value="ARS" className="py-3">ARS</SelectItem>
              <SelectItem value="USDT" className="py-3">USDT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); resetPage() }}>
            <SelectTrigger className="w-40 border-[#E5E5E5] rounded-xl h-12 px-4 text-base bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent sideOffset={8}>
              <SelectItem value="all" className="py-3">All types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k} className="py-3">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ─── Transaction Cards ─── */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl bg-[#F5F5F5]" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 bg-[#F5F5F5]" />
                    <Skeleton className="h-3 w-24 bg-[#F5F5F5]" />
                  </div>
                  <Skeleton className="h-5 w-20 bg-[#F5F5F5]" />
                </div>
              </div>
            ))
          ) : data?.data.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-10 text-center">
              <p className="text-sm text-[#666666]">No transactions found.</p>
            </div>
          ) : (
            data?.data.map((tx) => {
              const isDeposit = tx.type === "DEPOSIT" || tx.type === "YIELD"
              const sign = isDeposit ? "+" : "-"
              const amountColor = isDeposit ? "text-[#7C3AED]" : "text-[#111111]"
              const isExpanded = expandedId === tx.id
              const Icon = getTypeIcon(tx.type)

              return (
                <div key={tx.id} className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden">
                  {/* Card header (clickable) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isDeposit ? "bg-[#7C3AED]/10" : "bg-[#E5484D]/10"
                    }`}>
                      <Icon className={`size-4.5 ${isDeposit ? "text-[#7C3AED]" : "text-[#E5484D]"}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[tx.type] ?? "bg-[#F5F5F5] text-[#666666]"}`}>
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </span>
                        <span className="text-xs text-[#666666]">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#111111] mt-0.5">
                        {tx.description || (TYPE_LABELS[tx.type] ?? tx.type)}
                      </p>
                    </div>

                    {/* Amount + expand */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-base font-bold tabular-nums ${amountColor}`}>
                          {sign}{formatCurrency(tx.amount, tx.currency)}
                        </p>
                        {tx.status !== "COMPLETED" && (
                          <p className="text-xs font-medium text-[#E5A500]">
                            {STATUS_LABELS[tx.status] ?? tx.status}
                          </p>
                        )}
                      </div>
                      <RiArrowDownSLine className={`size-4 text-[#999999] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>

                  {/* Expanded timeline */}
                  {isExpanded && (
                    <div className="border-t border-[#E5E5E5] px-5 py-5 bg-[#FAFAFA]">
                      <p className="text-xs font-semibold text-[#666666] tracking-wide uppercase mb-4">Transaction timeline</p>
                      <TransactionTimeline type={tx.type} status={tx.status} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#666666]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <RiArrowLeftLine className="size-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <RiArrowRightLine className="size-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
