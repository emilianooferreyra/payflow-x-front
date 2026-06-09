"use client"

import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RiRefreshLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiFileList3Line,
  RiArrowUpBoxLine,
  RiArrowDownBoxLine,
  RiCalendar2Line,
  RiWallet2Line,
  RiShieldLine,
  RiCheckboxCircleLine,
} from "@remixicon/react"
import dynamic from "next/dynamic"
import { getMe } from "@/lib/api/auth"
import { getWallets } from "@/lib/api/wallet"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"
import type { KycStatus } from "@/lib/api/auth"

const KYC_STATUS: Record<KycStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; description: string }> = {
  PENDING: { label: "Pendiente", variant: "outline", description: "Completá tu verificación de identidad para operar" },
  IN_REVIEW: { label: "En revisión", variant: "secondary", description: "Estamos revisando tu documentación" },
  APPROVED: { label: "Verificada", variant: "default", description: "Tu identidad está verificada" },
  REJECTED: { label: "Rechazada", variant: "destructive", description: "Volvé a enviar tu documentación" },
}

const YieldChart = dynamic(
  () => import("./_components/yield-chart").then((m) => ({ default: m.YieldChart })),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full" /> },
)

const USD_APY = 3.65

function groupYieldByMonth(transactions: { type: string; amount: string; currency: string; createdAt: string }[]) {
  const groups: Record<string, { label: string; amount: number }> = {}

  for (const tx of transactions) {
    if (tx.type !== "YIELD" || tx.currency !== "USD") continue
    const date = new Date(tx.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = date.toLocaleDateString("es-AR", { month: "short" })
      .replace(".", "")
      .replace(/^\w/, (c) => c.toUpperCase())
    if (!groups[key]) groups[key] = { label, amount: 0 }
    groups[key].amount += Number(tx.amount)
  }

  let cumulative = 0
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => {
      cumulative += v.amount
      return { month: v.label, rendimiento: parseFloat(cumulative.toFixed(4)) }
    })
}

export default function DashboardPage() {
  const qc = useQueryClient()

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  })

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", 1, "", ""],
    queryFn: () => getTransactions({ page: 1, limit: 100 }),
  })

  const usd = wallets?.find((w) => w.currency === "USD")
  const usdBalance = Number(usd?.balance ?? 0)

  const allTx = txData?.data ?? []

  const totalYield = allTx
    .filter((tx) => tx.type === "YIELD" && tx.currency === "USD")
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  const now = new Date()
  const thisMonthYield = allTx
    .filter((tx) => {
      if (tx.type !== "YIELD" || tx.currency !== "USD") return false
      const d = new Date(tx.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  const chartData = txData?.data ? groupYieldByMonth(txData.data) : []

  const intPart = formatCurrency(usdBalance).replace(/\.\d+$/, "")
  const decPart = formatCurrency(usdBalance).match(/\.(\d+)$/)?.[1] ?? "00"

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-5">

        {/* KYC Status */}
        {user?.kyc && user.kyc.status !== "APPROVED" && (
          <Link href="/kyc">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 p-3">
                <RiShieldLine className="size-5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{KYC_STATUS[user.kyc.status].description}</p>
                </div>
                <Badge variant={KYC_STATUS[user.kyc.status].variant}>
                  {KYC_STATUS[user.kyc.status].label}
                </Badge>
                <RiArrowRightSLine className="size-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        )}

        {user?.kyc && user.kyc.status === "APPROVED" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RiCheckboxCircleLine className="size-3.5 text-emerald-500" />
            <span>Identidad verificada</span>
          </div>
        )}

        {/* Actualizar */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["me"] })
              qc.invalidateQueries({ queryKey: ["wallets"] })
              qc.invalidateQueries({ queryKey: ["transactions"] })
            }}
          >
            <RiRefreshLine className="size-4" />
            Actualizar
          </Button>
        </div>

        {/* Hero row: Balance + Quick actions */}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">

          {/* Balance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-sm bg-primary/10">
                  <RiWallet2Line className="size-5 text-primary" />
                </div>
                <p className="text-sm font-bold text-black">Balance</p>
              </div>

              {walletsLoading ? (
                <>
                  <Skeleton className="h-12 w-56 mb-4" />
                  <Skeleton className="h-5 w-44" />
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-5xl font-bold tabular-nums tracking-tight">{intPart}</span>
                    <span className="text-2xl font-bold text-black tabular-nums">.{decPart}</span>
                    <Badge className="ml-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 gap-1 text-xs font-bold">
                      <RiArrowUpLine className="size-3" />
                      {USD_APY}% APY
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-semibold">USD Digital</Badge>
                    <Link
                      href="/wallet"
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                    >
                      Ver información de la cuenta
                      <RiArrowRightSLine className="size-4" />
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-3">
            {[
              {
                href: "/transactions",
                icon: RiFileList3Line,
                label: "Transacciones",
                description: "Consulta el historial de movimientos",
              },
              {
                href: "/retirar",
                icon: RiArrowUpBoxLine,
                label: "Retiros",
                description: "Envía fondos a cuentas externas",
              },
              {
                href: "/depositar",
                icon: RiArrowDownBoxLine,
                label: "Depósitos",
                description: "Agrega fondos a tu cuenta",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="flex items-center gap-4 px-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight">{item.label}</p>
                      <p className="text-xs font-semibold text-muted-foreground truncate mt-0.5">{item.description}</p>
                    </div>
                    <RiArrowRightSLine className="size-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Rendimientos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold">Rendimientos</h2>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-bold gap-1.5 text-xs px-2 py-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                Activo
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground hidden lg:block">
              Los rendimientos de este mes se acreditarán el primer día del próximo mes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {txLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 px-2">
                    <Skeleton className="size-12 rounded-xl shrink-0" />
                    <div>
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-7 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="flex items-center gap-4 px-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                      <span className="text-xl font-bold text-primary leading-none">%</span>
                    </div>
                    <div>
                      <p className="text-md text-black font-bold mb-1">Tasa anual</p>
                      <p className="text-2xl font-semibold tabular-nums">{USD_APY}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 px-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                      <span className="text-xl font-bold text-primary leading-none">$</span>
                    </div>
                    <div>
                      <p className="text-md font-bold text-black mb-1">Total generado</p>
                      <p className="text-2xl font-semibold tabular-nums">{formatCurrency(totalYield)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 px-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                      <RiCalendar2Line className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-md font-bold text-black mb-1">Generado este mes</p>
                      <p className="text-2xl font-semibold tabular-nums">{formatCurrency(thisMonthYield)}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Historial mensual */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Historial mensual</CardTitle>
              <p className="text-xs text-muted-foreground">3 meses</p>
            </div>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
                Sin datos de rendimiento aún.
              </div>
            ) : (
              <YieldChart data={chartData} />
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
