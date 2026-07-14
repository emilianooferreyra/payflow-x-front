"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { computeCosts } from "../_lib/calculate"
import type { TariffResponse } from "../_lib/types"

const DEFAULT_AMOUNT = 1_000_000
const MIN_AMOUNT = 1_000

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const currencyFine = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
})

const integer = new Intl.NumberFormat("es-AR")

function parseAmount(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "")
  return digits ? Number(digits) : 0
}

export function CedearsCalculator({ tariff }: { tariff: TariffResponse }) {
  const [rawAmount, setRawAmount] = useState(integer.format(DEFAULT_AMOUNT))
  const [expanded, setExpanded] = useState<string | null>(null)

  const amount = parseAmount(rawAmount)
  const isValid = amount >= MIN_AMOUNT

  const results = useMemo(
    () => (isValid ? computeCosts(tariff, amount) : []),
    [tariff, amount, isValid],
  )

  const winner = results[0]
  const verifiedAt = tariff.brokers[0]?.lastVerifiedAt
  const verifiedLabel = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
    : null

  async function handleShare() {
    const url = window.location.href
    const title = "¿Cuánto cuesta invertir en CEDEARs? Comparador de brokers"
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado al portapapeles")
    } catch {
      /* usuario canceló el share — no es un error */
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Cuánto te cuesta invertir en CEDEARs?
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-balance">
          Compará el costo REAL de ida y vuelta (compra + venta) entre brokers
          argentinos: comisiones, IVA y derechos de mercado. Sin registro.
        </p>
        {verifiedLabel && (
          <Badge variant="secondary" className="mt-4">
            Datos verificados el {verifiedLabel} · fuentes citadas por broker
          </Badge>
        )}
      </header>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Label htmlFor="amount" className="text-base">
            ¿Cuánto querés invertir?
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-muted-foreground text-lg font-medium">$</span>
            <Input
              id="amount"
              inputMode="numeric"
              autoComplete="off"
              value={rawAmount}
              onChange={(e) => {
                const value = parseAmount(e.target.value)
                setRawAmount(value ? integer.format(value) : "")
              }}
              className="h-12 text-lg font-semibold"
              aria-label="Monto a invertir en pesos argentinos"
            />
            <span className="text-muted-foreground text-sm">ARS</span>
          </div>
          {!isValid && (
            <p className="text-destructive mt-2 text-sm">
              Ingresá un monto de al menos {currency.format(MIN_AMOUNT)}.
            </p>
          )}
        </CardContent>
      </Card>

      {winner && (
        <section aria-label="Resultado del comparador" className="space-y-3">
          <ol className="space-y-3">
            {results.map((result, index) => {
              const isWinner = index === 0
              const isExpanded = expanded === result.slug
              return (
                <li key={result.slug}>
                  <Card
                    className={cn(
                      isWinner && "border-primary ring-primary/20 ring-2",
                    )}
                  >
                    <CardContent className="pt-6">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-3 text-left"
                        onClick={() =>
                          setExpanded(isExpanded ? null : result.slug)
                        }
                        aria-expanded={isExpanded}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{result.name}</span>
                            {isWinner && <Badge>Más barato</Badge>}
                            {result.isFromRange && (
                              <Badge variant="outline">desde</Badge>
                            )}
                            {result.subscription > 0 && (
                              <Badge variant="outline">suscripción</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {result.effectivePct.toLocaleString("es-AR")}% del
                            monto · tocá para ver el desglose
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold tabular-nums">
                            {currency.format(result.total)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            ida y vuelta
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-2 text-sm">
                          <Separator />
                          <dl className="grid grid-cols-[1fr_auto] gap-y-1 pt-2 tabular-nums">
                            <dt className="text-muted-foreground">
                              Comisión de compra
                            </dt>
                            <dd className="text-right">
                              {currencyFine.format(result.commissionBuy)}
                            </dd>
                            <dt className="text-muted-foreground">
                              Comisión de venta
                            </dt>
                            <dd className="text-right">
                              {currencyFine.format(result.commissionSell)}
                            </dd>
                            <dt className="text-muted-foreground">
                              IVA sobre comisiones ({tariff.meta.ivaPct}%)
                            </dt>
                            <dd className="text-right">
                              {currencyFine.format(result.ivaOnCommissions)}
                            </dd>
                            <dt className="text-muted-foreground">
                              Derechos de mercado BYMA (
                              {tariff.meta.marketRightsPct}% × 2)
                            </dt>
                            <dd className="text-right">
                              {currencyFine.format(result.marketRights)}
                            </dd>
                            <dt className="text-muted-foreground">
                              IVA sobre derechos
                            </dt>
                            <dd className="text-right">
                              {currencyFine.format(result.ivaOnMarketRights)}
                            </dd>
                            {result.subscription > 0 && (
                              <>
                                <dt className="text-muted-foreground">
                                  Suscripción (2 meses, c/IVA)
                                </dt>
                                <dd className="text-right">
                                  {currencyFine.format(result.subscription)}
                                </dd>
                              </>
                            )}
                          </dl>

                          {result.broker.feeNotes && (
                            <p className="text-muted-foreground">
                              📝 {result.broker.feeNotes}
                            </p>
                          )}
                          {result.broker.subscriptionNotes && (
                            <p className="text-muted-foreground">
                              💳 {result.broker.subscriptionNotes}
                            </p>
                          )}
                          {result.broker.custodyNotes && (
                            <p className="text-muted-foreground">
                              🏦 Custodia: {result.broker.custodyNotes}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            Fuentes:{" "}
                            {result.broker.sources.map((source, i) => (
                              <span key={source.url}>
                                {i > 0 && " · "}
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  {source.label}
                                </a>
                              </span>
                            ))}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <footer className="text-muted-foreground mt-10 space-y-4 text-center text-xs">
        <p>
          Cálculo sobre el plan base de cada broker. La venta se estima al mismo
          valor que la compra (no proyectamos ganancia ni pérdida). Derechos de
          mercado:{" "}
          <a
            href={tariff.meta.marketRightsSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {tariff.meta.marketRightsSource.label}
          </a>
          .
        </p>
        <p className="font-medium">
          Esto NO es asesoramiento financiero. Las tarifas pueden cambiar sin
          aviso: verificá siempre con tu broker antes de operar.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleShare}>
            Compartir
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://ivnoff.vercel.app/es"
              target="_blank"
              rel="noopener noreferrer"
            >
              ¿Falta tu broker? Escribime
            </a>
          </Button>
        </div>
      </footer>
    </main>
  )
}
