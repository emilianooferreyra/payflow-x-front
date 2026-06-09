"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Retiro",
  EXCHANGE: "Conversión",
  INVESTMENT_BUY: "Compra",
  INVESTMENT_SELL: "Venta",
  YIELD: "Rendimiento",
  TRANSFER: "Transferencia",
}

const TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  WITHDRAWAL: "bg-destructive/10 text-destructive",
  EXCHANGE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INVESTMENT_BUY: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  INVESTMENT_SELL: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  YIELD: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  TRANSFER: "bg-muted text-muted-foreground",
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "text-emerald-600 dark:text-emerald-400",
  PENDING: "text-amber-600 dark:text-amber-400",
  FAILED: "text-destructive",
  CANCELLED: "text-muted-foreground",
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [currency, setCurrency] = useState("")
  const [type, setType] = useState("")

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
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <div>
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <p className="text-muted-foreground text-sm">Your full activity history</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={currency || "all"} onValueChange={(v) => { setCurrency(v === "all" ? "" : v); resetPage() }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); resetPage() }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">
                {data ? `${data.meta.total} transactions` : "Transactions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : data?.data.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No transactions found.</p>
              ) : (
                <div className="divide-y">
                  {data?.data.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[tx.type] ?? "bg-muted text-muted-foreground"}`}>
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {tx.description || (TYPE_LABELS[tx.type] ?? tx.type)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString("es-AR", {
                                month: "short", day: "numeric", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                            {tx.status && tx.status !== "COMPLETED" && (
                              <span className={`text-xs font-medium ${STATUS_COLORS[tx.status] ?? "text-muted-foreground"}`}>
                                · {tx.status === "PENDING" ? "Pendiente" : tx.status === "FAILED" ? "Fallido" : tx.status === "CANCELLED" ? "Cancelado" : tx.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(tx.amount, tx.currency)}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">{tx.currency}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <RiArrowLeftLine className="mr-1.5 size-4" />Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next<RiArrowRightLine className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
  )
}
