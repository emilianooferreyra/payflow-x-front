import type { Metadata } from "next"
import { connection } from "next/server"
import { CedearsCalculator } from "./_components/cedears-calculator"
import type { TariffResponse } from "./_lib/types"

export const metadata: Metadata = {
  title: "¿Cuánto cuesta invertir en CEDEARs? Comparador de comisiones",
  description:
    "Compará el costo real de invertir en CEDEARs entre brokers argentinos (IOL, Balanz, PPI, Cocos, Bull Market, IEB+): comisiones de compra y venta, IVA y derechos de mercado. Datos verificados con fuentes, sin registro.",
}

// El fetch server-side necesita URL absoluta: el rewrite relativo de
// next.config.ts solo aplica a requests del navegador.
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
const API_URL = RAW_API_URL.startsWith("http")
  ? RAW_API_URL
  : "http://localhost:3000/api/v1"

export default async function CedearsPage() {
  await connection()

  let tariff: TariffResponse | null = null
  try {
    const res = await fetch(`${API_URL}/brokers`)
    if (res.ok) tariff = (await res.json()) as TariffResponse
  } catch {
    tariff = null
  }

  if (!tariff || tariff.brokers.length === 0) {
    return (
      <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Comparador de costos de CEDEARs
        </h1>
        <p className="text-muted-foreground">
          No pudimos cargar el tarifario en este momento. Probá de nuevo en
          unos minutos.
        </p>
      </main>
    )
  }

  return <CedearsCalculator tariff={tariff} />
}
