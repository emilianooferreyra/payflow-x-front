"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/lib/api/auth"
import { getWallets } from "@/lib/api/wallet"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"
import {
  RiArrowRightUpLine,
  RiArrowDownLine,
  RiArrowRightSLine,
  RiRefreshLine,
  RiWallet3Line,
  RiArrowUpDownLine,
  RiBankLine,
  RiPercentLine,
  RiCoinLine,
  RiCalendarLine,
} from "@remixicon/react"

const chartData = [
  { label: "Sep", value: 8200 },
  { label: "Oct", value: 8500 },
  { label: "Nov", value: 9100 },
  { label: "Dec", value: 8800 },
  { label: "Jan", value: 9300 },
  { label: "Feb", value: 9604 },
]

function ChartPath({ data, width, height }: { data: { value: number }[]; width: number; height: number }) {
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 1
  const padding = 4
  const chartW = width - padding * 2
  const chartH = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW
    const y = padding + chartH - ((d.value - min) / range) * chartH
    return { x, y }
  })

  const lineD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cx = (prev.x + p.x) / 2
    return `Q ${cx} ${prev.y} ${p.x} ${p.y}`
  }).join(" ")

  const areaD = `${lineD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chart-gradient)" />
      <path d={lineD} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7C3AED" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  )
}

export default function DashboardPage() {
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  })
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const usdBalance = Number(wallets?.find((w) => w.currency === "USD")?.balance ?? 0)

  const { data: recentTxns } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => getTransactions({ page: 1, limit: 5 }),
  })

  const pendingAmount = recentTxns?.data
    ?.filter((tx) => tx.status === "PENDING" && tx.type !== "WITHDRAWAL")
    ?.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0

  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 lg:py-10">

        {/* ─── Top Bar ─── */}
        <div className="flex items-center justify-end mb-8">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors">
            <RiRefreshLine className="size-3.5" />
            Refresh
          </button>
        </div>

        {/* ─── Main Grid: Balance + Quick Actions ─── */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-10">

          {/* Balance Hero Card */}
          <div className="rounded-2xl bg-white p-7 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <RiWallet3Line className="size-5 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-medium text-[#666666]">Balance</span>
            </div>

            {/* Balance + Yield */}
            {isLoading ? (
              <div className="h-14 w-56 animate-pulse rounded-lg bg-[#F5F5F5] mb-4" />
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold tabular-nums tracking-tight text-[#111111]">
                    {formatCurrency(usdBalance).replace(/\.\d+$/, "")}
                  </span>
                  <span className="text-2xl font-extrabold tabular-nums tracking-tight text-[#999999]">
                    .{String(usdBalance.toFixed(2)).split(".")[1] ?? "00"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-semibold text-[#22C55E]">
                  ↗ 3% APY
                </span>
              </div>
            )}

            {/* Account identifier + details link */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center rounded-full bg-[#7C3AED]/10 px-3 py-1 text-xs font-semibold text-[#7C3AED]">
                USD Digital
              </span>
              <Link
                href="/depositar"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#999999] hover:text-[#666666] transition-colors"
              >
                <RiBankLine className="size-3.5" />
                View account details
                <RiArrowRightSLine className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Link
              href="/transacciones"
              className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#7C3AED]/10 transition-colors">
                <RiArrowUpDownLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111111]">Transactions</p>
                <p className="text-xs text-[#666666] mt-0.5">View account activity</p>
              </div>
              <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
            </Link>

            <Link
              href="/retirar"
              className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#7C3AED]/10 transition-colors">
                <RiArrowRightUpLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111111]">Withdraw</p>
                <p className="text-xs text-[#666666] mt-0.5">Send funds externally</p>
              </div>
              <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
            </Link>

            <Link
              href="/depositar"
              className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#7C3AED]/10 transition-colors">
                <RiArrowDownLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111111]">Deposit</p>
                <p className="text-xs text-[#666666] mt-0.5">Add funds to your account</p>
              </div>
              <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#7C3AED]" />
            </Link>
          </div>
        </div>

        {/* ─── Yields ─── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Yields</h2>
            <span className="flex items-center gap-1 text-xs text-[#22C55E]">
              <span className="inline-flex size-1.5 rounded-full bg-[#22C55E]" />
              Active
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <RiPercentLine className="size-4.5 text-[#7C3AED]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Annual Rate</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">3%</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <RiCoinLine className="size-4.5 text-[#7C3AED]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Total Earned</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">$12.02</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <RiCalendarLine className="size-4.5 text-[#7C3AED]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Generated This Month</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mini Ledger ─── */}
        <div className="grid gap-6 mb-10 lg:grid-cols-[2.5fr_1.5fr]">

          {/* Recent Activity */}
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 lg:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Recent Activity</h2>
              <Link
                href="/transacciones"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7C3AED] transition-colors"
              >
                View all
                <RiArrowRightSLine className="size-3.5" />
              </Link>
            </div>

            {!recentTxns ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-[#F5F5F5]" />
                ))}
              </div>
            ) : recentTxns.data.length === 0 ? (
              <p className="text-sm text-[#666666] py-6 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-0.5">
                {recentTxns.data.slice(0, 5).map((tx) => {
                  const isInflow = tx.type === "DEPOSIT" || tx.type === "YIELD"
                  return (
                    <Link
                      key={tx.id}
                      href="/transacciones"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F5F5F5] transition-colors -mx-3"
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isInflow ? "bg-[#7C3AED]/10" : "bg-[#E5484D]/10"
                      }`}>
                        {isInflow ? (
                          <RiArrowDownLine className="size-3.5 text-[#7C3AED]" />
                        ) : (
                          <RiArrowRightUpLine className="size-3.5 text-[#E5484D]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111111] truncate">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold tabular-nums ${
                        isInflow ? "text-[#7C3AED]" : "text-[#111111]"
                      }`}>
                        {isInflow ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Balance Summary */}
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 lg:p-7">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Balance Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-[#F5F5F5] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#666666]">Available</span>
                  <span className="inline-flex size-1.5 rounded-full bg-[#22C55E]" />
                </div>
                <p className="text-2xl font-bold text-[#111111]">
                  {formatCurrency(usdBalance)}
                </p>
              </div>

              <div className="rounded-xl bg-[#F5F5F5] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#666666]">Pending</span>
                  <span className="inline-flex size-1.5 rounded-full bg-[#E5A500]" />
                </div>
                <p className="text-2xl font-bold text-[#111111]">
                  {formatCurrency(pendingAmount)}
                </p>
                <p className="text-xs text-[#666666] mt-1">
                  Deposits settling from recent activity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Performance Chart ─── */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 lg:p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Monthly History</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-[#666666]">
              3 Months
              <RiArrowRightSLine className="size-3.5" />
            </span>
          </div>

          <div className="w-full">
            <ChartPath data={chartData} width={600} height={180} />
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 px-1">
            {chartData.map((d) => (
              <span key={d.label} className="text-xs text-[#666666]">{d.label}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
