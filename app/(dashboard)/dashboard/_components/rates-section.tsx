"use client"

import { useQuery } from "@tanstack/react-query"
import { getExchangeRates } from "@/lib/api/exchange-rates"
import { RiAlertLine } from "@remixicon/react"

export function RatesSection() {
  const { data: rates, isLoading, error } = useQuery({
    queryKey: ["rates"],
    queryFn: getExchangeRates,
    staleTime: 5 * 60 * 1000,
  })

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
        <RiAlertLine className="size-4 text-destructive shrink-0" />
        <p className="text-xs text-destructive">Tipos de cambio no disponibles</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 w-28 animate-pulse rounded-lg bg-[#F5F5F5]" />
        ))}
      </div>
    )
  }

  if (!rates?.length) {
    return <p className="text-xs text-[#999999]">No hay tipos de cambio disponibles</p>
  }

  return (
    <div className="flex flex-wrap gap-4">
      {rates.map((rate) => (
        <div key={`${rate.fromCurrency}-${rate.toCurrency}`} className="flex items-center gap-2 rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5">
          <span className="text-xs font-medium text-[#666666]">
            {rate.fromCurrency}/{rate.toCurrency}
          </span>
          <span className="text-sm font-semibold text-[#111111] tabular-nums">
            {Number(rate.rate).toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  )
}
