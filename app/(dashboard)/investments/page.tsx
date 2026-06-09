"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react"
import { getPortfolio, getAssets, buyAsset, sellAsset, type Asset, type Investment } from "@/lib/api/investments"
import { getErrorMessage } from "@/lib/api/error"
import { formatCurrency } from "@/lib/utils"

const buySchema = z.object({ amount: z.coerce.number().positive() })
const sellSchema = z.object({ quantity: z.coerce.number().positive() })
type BuyInput = z.output<typeof buySchema>
type SellInput = z.output<typeof sellSchema>

function BuyModal({ asset, open, onClose }: { asset: Asset | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { register: field, handleSubmit, watch, reset, formState: { errors } } = useForm<z.input<typeof buySchema>, unknown, BuyInput>({
    resolver: zodResolver(buySchema),
  })
  const amount = Number(watch("amount"))
  const estimatedQty = asset && amount > 0 ? (amount / Number(asset.currentPrice)).toFixed(6) : null

  const { mutate, isPending } = useMutation({
    mutationFn: buyAsset,
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["portfolio"] })
      qc.invalidateQueries({ queryKey: ["wallets"] })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      toast.success(`Bought ${asset?.symbol}`)
      reset()
      onClose()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {asset?.symbol}</DialogTitle>
          <DialogDescription>{asset?.name} · Current price: {asset ? formatCurrency(Number(asset.currentPrice)) : "—"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => { if (asset) mutate({ assetId: asset.id, amount: d.amount }) })} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Amount (USD)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...field("amount")} />
            {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
          </div>
          {estimatedQty && (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm flex justify-between">
              <span className="text-muted-foreground">You receive ≈</span>
              <span className="font-medium">{estimatedQty} {asset?.symbol}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose() }}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending}>
              {isPending ? "Processing…" : "Buy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SellModal({ investment, open, onClose }: { investment: Investment | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { register: field, handleSubmit, watch, reset, formState: { errors } } = useForm<z.input<typeof sellSchema>, unknown, SellInput>({
    resolver: zodResolver(sellSchema),
  })
  const qty = Number(watch("quantity"))
  const estimatedValue = investment && qty > 0 ? (qty * Number(investment.asset.currentPrice)).toFixed(2) : null

  const { mutate, isPending } = useMutation({
    mutationFn: sellAsset,
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["portfolio"] })
      qc.invalidateQueries({ queryKey: ["wallets"] })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      toast.success(`Sold ${investment?.asset.symbol}`)
      reset()
      onClose()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {investment?.asset.symbol}</DialogTitle>
          <DialogDescription>
            You hold {investment?.quantity} {investment?.asset.symbol} · Price: {investment ? formatCurrency(Number(investment.asset.currentPrice)) : "—"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => { if (investment) mutate({ assetId: investment.asset.id, quantity: d.quantity }) })} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Quantity ({investment?.asset.symbol})</Label>
            <Input type="number" step="0.000001" placeholder="0.000000" {...field("quantity")} />
            {errors.quantity && <p className="text-destructive text-xs">{errors.quantity.message}</p>}
          </div>
          {estimatedValue && (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm flex justify-between">
              <span className="text-muted-foreground">You receive ≈</span>
              <span className="font-medium">{formatCurrency(Number(estimatedValue))}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose() }}>Cancel</Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={isPending}>
              {isPending ? "Processing…" : "Sell"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function InvestmentsPage() {
  const [buyTarget, setBuyTarget] = useState<Asset | null>(null)
  const [sellTarget, setSellTarget] = useState<Investment | null>(null)

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
    staleTime: 5 * 60_000,
  })
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    staleTime: 5 * 60_000,
  })

  const pnl = portfolio?.summary
  const pnlPositive = (pnl?.totalPnL ?? 0) >= 0

  return (
    <>
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <div>
            <h1 className="text-2xl font-semibold">Investments</h1>
            <p className="text-muted-foreground text-sm">Your portfolio and available assets</p>
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            {portfolioLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32 mt-2" /></CardHeader></Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Portfolio Value</CardDescription>
                    <CardTitle className="text-3xl font-semibold tabular-nums">{pnl ? formatCurrency(Number(pnl.totalValue)) : "—"}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total P&L</CardDescription>
                    <CardTitle className={`text-3xl font-semibold tabular-nums flex items-center gap-1 ${pnlPositive ? "text-emerald-500" : "text-destructive"}`}>
                      {pnlPositive ? <RiArrowUpLine className="size-6" /> : <RiArrowDownLine className="size-6" />}
                      {pnl ? formatCurrency(Number(pnl.totalPnL)) : "—"}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Return</CardDescription>
                    <CardTitle className={`text-3xl font-semibold tabular-nums ${pnlPositive ? "text-emerald-500" : "text-destructive"}`}>
                      {pnl ? `${pnlPositive ? "+" : ""}${pnl.totalPnLPercent}%` : "—"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>

          {/* My positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My positions</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : portfolio?.investments.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No positions yet. Buy an asset below.</p>
              ) : (
                <div className="divide-y">
                  {portfolio?.investments.map((inv) => {
                    const cost = Number(inv.avgBuyPrice) * Number(inv.quantity)
                    const value = Number(inv.currentValue)
                    const invPnl = value - cost
                    const positive = invPnl >= 0
                    return (
                      <div key={inv.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {inv.asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{inv.asset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{Number(inv.quantity).toFixed(6)} units</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(inv.currentValue))}</p>
                            <p className={`text-xs tabular-nums ${positive ? "text-emerald-500" : "text-destructive"}`}>
                              {positive ? "+" : ""}{formatCurrency(invPnl)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setSellTarget(inv)}>
                            Sell
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available assets</CardTitle>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {assets?.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(asset.currentPrice))}</p>
                        <Button size="sm" onClick={() => setBuyTarget(asset)}>Buy</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BuyModal asset={buyTarget} open={!!buyTarget} onClose={() => setBuyTarget(null)} />
      <SellModal investment={sellTarget} open={!!sellTarget} onClose={() => setSellTarget(null)} />
    </>
  )
}
