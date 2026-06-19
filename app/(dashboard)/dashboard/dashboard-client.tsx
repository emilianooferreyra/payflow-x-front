"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { getWallets } from "@/lib/api/wallet"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"
import { ErrorBoundary } from "./_components/error-boundary"
import { BalanceSection } from "./_components/balance-section"
import { ActivitySection } from "./_components/activity-section"
import { RatesSection } from "./_components/rates-section"
import {
  RiArrowRightUpLine,
  RiArrowDownLine,
  RiArrowRightSLine,
  RiRefreshLine,
  RiArrowUpDownLine,
  RiPercentLine,
  RiCoinLine,
  RiCalendarLine,
} from "@remixicon/react"

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-[#F5F5F5]" />
      ))}
    </div>
  )
}

function QuickActions() {
  return (
    <div className="space-y-3">
      <Link
        href="/transacciones"
        className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#111111]/10 transition-colors">
          <RiArrowUpDownLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111111]">Transacciones</p>
          <p className="text-xs text-[#666666] mt-0.5">Ver actividad de la cuenta</p>
        </div>
        <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
      </Link>

      <Link
        href="/retirar"
        className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#111111]/10 transition-colors">
          <RiArrowRightUpLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111111]">Retirar</p>
          <p className="text-xs text-[#666666] mt-0.5">Enviar fondos externamente</p>
        </div>
        <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
      </Link>

      <Link
        href="/depositar"
        className="flex items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#111111]/10 transition-colors">
          <RiArrowDownLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111111]">Depositar</p>
          <p className="text-xs text-[#666666] mt-0.5">Agregar fondos a tu cuenta</p>
        </div>
        <RiArrowRightSLine className="size-4 text-[#666666] group-hover:text-[#111111]" />
      </Link>
    </div>
  )
}

function BalanceSummary() {
  const { data: wallets } = useQuery({ queryKey: ["wallets"], queryFn: getWallets })
  const { data: recentTxns } = useQuery({
    queryKey: ["transactions", 1, "", ""],
    queryFn: () => getTransactions({ page: 1, limit: 5 }),
  })

  const usdBalance = Number(wallets?.find((w) => w.currency === "USD")?.balance ?? 0)
  const pendingAmount = recentTxns?.data
    ?.filter((tx) => tx.status === "PENDING" && tx.type !== "WITHDRAWAL")
    ?.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#F5F5F5] p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#666666]">Disponible</span>
          <span className="inline-flex size-1.5 rounded-full bg-[#22C55E]" />
        </div>
        <p className="text-2xl font-bold text-[#111111]">{formatCurrency(usdBalance)}</p>
      </div>

      <div className="rounded-xl bg-[#F5F5F5] p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#666666]">Pendiente</span>
          <span className="inline-flex size-1.5 rounded-full bg-[#E5A500]" />
        </div>
        <p className="text-2xl font-bold text-[#111111]">{formatCurrency(pendingAmount)}</p>
        <p className="text-xs text-[#666666] mt-1">Depósitos pendientes de actividad reciente</p>
      </div>
    </div>
  )
}

export default function DashboardClient() {
  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 lg:py-10">

        {/* ─── Top Bar ─── */}
        <div className="flex items-center justify-end mb-8">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors">
            <RiRefreshLine className="size-3.5" />
            Actualizar
          </button>
        </div>

        {/* ─── Main Grid: Balance + Quick Actions ─── */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-10">
          <ErrorBoundary>
            <BalanceSection />
          </ErrorBoundary>
          <QuickActions />
        </div>

        {/* ─── Yields ─── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Rendimientos</h2>
            <span className="flex items-center gap-1 text-xs text-[#22C55E]">
              <span className="inline-flex size-1.5 rounded-full bg-[#22C55E]" />
              Activo
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#111111]/10">
                <RiPercentLine className="size-4.5 text-[#111111]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Tasa anual</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">3%</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#111111]/10">
                <RiCoinLine className="size-4.5 text-[#111111]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Ganado total</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">$12.02</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#111111]/10">
                <RiCalendarLine className="size-4.5 text-[#111111]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#666666]">Generado este mes</p>
                <p className="text-xl font-bold text-[#111111] mt-0.5">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mini Ledger ─── */}
        <div className="grid gap-6 mb-10 lg:grid-cols-[2.5fr_1.5fr]">
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 lg:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Actividad reciente</h2>
              <Link
                href="/transacciones"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#111111] transition-colors"
              >
                Ver todo
                <RiArrowRightSLine className="size-3.5" />
              </Link>
            </div>
            <ErrorBoundary>
              <Suspense fallback={<ActivitySkeleton />}>
                <ActivitySection />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 lg:p-7">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase">Resumen de saldo</h2>
            </div>
            <BalanceSummary />
          </div>
        </div>

        {/* ─── Rates ─── */}
        <div>
          <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase mb-4">Tipos de cambio</h2>
          <ErrorBoundary>
            <RatesSection />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
