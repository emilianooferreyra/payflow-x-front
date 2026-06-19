"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

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
          <DialogTitle>Comprar {asset?.symbol}</DialogTitle>
          <DialogDescription>{asset?.name} · Precio actual: {asset ? formatCurrency(Number(asset.currentPrice)) : "—"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => { if (asset) mutate({ assetId: asset.id, amount: d.amount }) })} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Monto (USD)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...field("amount")} />
            {errors.amount && <p className="text-[#E5484D] text-xs">{errors.amount.message}</p>}
          </div>
          {estimatedQty && (
            <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-sm flex justify-between">
              <span className="text-[#666666]">Recibís ≈</span>
              <span className="font-medium">{estimatedQty} {asset?.symbol}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all flex-1"
              onClick={() => { reset(); onClose() }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              disabled={isPending}
            >
              {isPending ? "Procesando…" : "Comprar"}
            </button>
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
          <DialogTitle>Vender {investment?.asset.symbol}</DialogTitle>
          <DialogDescription>
            Tenés {investment?.quantity} {investment?.asset.symbol} · Precio: {investment ? formatCurrency(Number(investment.asset.currentPrice)) : "—"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => { if (investment) mutate({ assetId: investment.asset.id, quantity: d.quantity }) })} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Quantity ({investment?.asset.symbol})</Label>
            <Input type="number" step="0.000001" placeholder="0.000000" {...field("quantity")} />
            {errors.quantity && <p className="text-[#E5484D] text-xs">{errors.quantity.message}</p>}
          </div>
          {estimatedValue && (
            <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-sm flex justify-between">
              <span className="text-[#666666]">Recibís ≈</span>
              <span className="font-medium">{formatCurrency(Number(estimatedValue))}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all flex-1"
              onClick={() => { reset(); onClose() }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 gap-2 rounded-xl border-2 border-[#E5484D] bg-white px-6 text-base font-semibold text-[#E5484D] shadow-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              disabled={isPending}
            >
              {isPending ? "Procesando…" : "Vender"}
            </button>
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
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              CARTERA
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Inversiones
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Comprá y vendé activos, seguí tu cartera en tiempo real.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {portfolioLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <p className="text-sm text-[#666666] mb-1">Valor de cartera</p>
                <p className="text-[#111111] text-3xl font-semibold tabular-nums">{pnl ? formatCurrency(Number(pnl.totalValue)) : "—"}</p>
              </div>
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <p className="text-sm text-[#666666] mb-1">Ganancia/Pérdida total</p>
                <p className={`text-[#111111] text-3xl font-semibold tabular-nums flex items-center gap-1 ${pnlPositive ? "text-emerald-500" : "text-[#E5484D]"}`}>
                  {pnlPositive ? <RiArrowUpLine className="size-6" /> : <RiArrowDownLine className="size-6" />}
                  {pnl ? formatCurrency(Number(pnl.totalPnL)) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <p className="text-sm text-[#666666] mb-1">Retorno</p>
                <p className={`text-[#111111] text-3xl font-semibold tabular-nums ${pnlPositive ? "text-emerald-500" : "text-[#E5484D]"}`}>
                  {pnl ? `${pnlPositive ? "+" : ""}${pnl.totalPnLPercent}%` : "—"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* My positions */}
        <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">Mis posiciones</h3>
          {portfolioLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : portfolio?.investments.length === 0 ? (
            <p className="py-8 text-center text-[#666666]">Sin posiciones aún. Comprá un activo debajo.</p>
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
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#F5F5F5] text-xs font-bold">
                        {inv.asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{inv.asset.symbol}</p>
                        <p className="text-xs text-[#666666]">{Number(inv.quantity).toFixed(6)} unidades</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(inv.currentValue))}</p>
                        <p className={`text-xs tabular-nums ${positive ? "text-emerald-500" : "text-[#E5484D]"}`}>
                          {positive ? "+" : ""}{formatCurrency(invPnl)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSellTarget(inv)}
                        className="h-9 gap-2 rounded-xl border-2 border-[#E5484D] bg-white px-4 text-sm font-semibold text-[#E5484D] shadow-sm hover:bg-red-50 transition-all"
                      >
                        Vender
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Available assets */}
        <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
          <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">Activos disponibles</h3>
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
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-bold text-[#059669]">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{asset.symbol}</p>
                      <p className="text-xs text-[#666666]">{asset.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(asset.currentPrice))}</p>
                    <button
                      onClick={() => setBuyTarget(asset)}
                      className="h-9 gap-2 rounded-xl bg-white border-2 border-[#111111] px-4 text-sm font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BuyModal asset={buyTarget} open={!!buyTarget} onClose={() => setBuyTarget(null)} />
      <SellModal investment={sellTarget} open={!!sellTarget} onClose={() => setSellTarget(null)} />
    </main>
  )
}
