import type { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import { CedearsCalculator } from "./_components/cedears-calculator"
import type { TariffResponse } from "./_lib/types"

export const metadata: Metadata = {
  title: "¿Cuánto cuesta invertir en CEDEARs? Comparador de comisiones",
  description:
    "Compará el costo real de invertir en CEDEARs entre brokers argentinos (IOL, Balanz, PPI, Cocos, Bull Market, IEB+): comisiones de compra y venta, IVA y derechos de mercado. Datos verificados con fuentes, sin registro.",
}

// El fetch server-side necesita URL absoluta: el rewrite relativo de
// next.config.ts solo aplica a requests del navegador. Se fuerza 127.0.0.1
// porque Node resuelve localhost a ::1 (IPv6) y Docker/Colima publica el
// backend solo en IPv4.
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000/api/v1"
const API_URL = (
  RAW_API_URL.startsWith("http") ? RAW_API_URL : "http://127.0.0.1:3000/api/v1"
).replace("://localhost", "://127.0.0.1")

// Data pública e igual para todos → 'use cache' + PPR: el shell se
// prerenderiza y el tarifario se cachea por horas. El throw es deliberado:
// los errores NO se cachean, así un fetch fallido no congela una página
// rota hasta que expire el cache.
async function getTariff(): Promise<TariffResponse> {
  "use cache"
  cacheLife("hours")
  cacheTag("brokers-tariff")

  const res = await fetch(`${API_URL}/brokers`)
  if (!res.ok) throw new Error(`Tariff fetch failed: ${res.status}`)
  return (await res.json()) as TariffResponse
}

export default async function CedearsPage() {
  let tariff: TariffResponse | null = null
  try {
    tariff = await getTariff()
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
