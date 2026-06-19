"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getWallets } from "@/lib/api/wallet"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RiAlertLine, RiRefreshLine, RiWallet3Line, RiBankLine, RiArrowRightSLine } from "@remixicon/react"

export function BalanceSection() {
  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  })

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-7 lg:p-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
          <RiAlertLine className="size-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">No se pudo cargar el saldo</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Hubo un problema al obtener los datos de tu cuenta.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-1.5">
          <RiRefreshLine className="size-3.5" />
          Reintentar
        </Button>
      </div>
    )
  }

  const usdBalance = Number(wallets?.find((w) => w.currency === "USD")?.balance ?? 0)

  return (
    <div className="rounded-2xl bg-white p-7 lg:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#111111]/10">
          <RiWallet3Line className="size-5 text-[#111111]" />
        </div>
        <span className="text-xs font-medium text-[#666666]">Saldo</span>
      </div>

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

      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center rounded-full bg-[#111111]/10 px-3 py-1 text-xs font-semibold text-[#111111]">
          USD Digital
        </span>
        <button
          onClick={() => toast.info("Próximamente")}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#999999] hover:text-[#666666] transition-colors"
        >
          <RiBankLine className="size-3.5" />
          Ver detalles de la cuenta
          <RiArrowRightSLine className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
