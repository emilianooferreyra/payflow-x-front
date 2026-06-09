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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RiArrowUpCircleLine, RiArrowRightLine, RiBankLine } from "@remixicon/react"
import { getWallets } from "@/lib/api/wallet"
import { withdraw } from "@/lib/api/wallet"
import { getTransactions } from "@/lib/api/transactions"
import { savedAccounts } from "@/lib/mock/banking"
import { getErrorMessage } from "@/lib/api/error"
import { formatCurrency } from "@/lib/utils"

const CURRENCIES = ["USD", "ARS", "USDT"] as const

const FEE_RATE = 0.001 // 0.1%
const FEE_MIN = 0
const FEE_MAX = 5

function calcFee(amount: number) {
  return Math.min(FEE_MAX, Math.max(FEE_MIN, amount * FEE_RATE))
}

const schema = z.object({
  currency: z.enum(["USD", "ARS", "USDT"]),
  amount: z.coerce.number().positive("Enter a valid amount"),
  destinationId: z.string().min(1, "Select a destination"),
  description: z.string().optional(),
})

type FormInput = z.output<typeof schema>

export default function RetirarPage() {
  const qc = useQueryClient()
  const [step, setStep] = useState<"form" | "confirm">("form")
  const [pending, setPending] = useState<FormInput | null>(null)

  const { data: wallets } = useQuery({ queryKey: ["wallets"], queryFn: getWallets })
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", 1, "", "WITHDRAW"],
    queryFn: () => getTransactions({ page: 1, limit: 10, type: "WITHDRAW" }),
  })

  const { register: field, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.input<typeof schema>, unknown, FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD" },
  })

  const currency = watch("currency")
  const amount = Number(watch("amount")) || 0
  const destinationId = watch("destinationId")

  const wallet = wallets?.find((w) => w.currency === currency)
  const fee = calcFee(Number(amount))
  const youReceive = Math.max(0, Number(amount) - fee)
  const destination = savedAccounts.find((a) => a.id === destinationId)

  const { mutate, isPending } = useMutation({
    mutationFn: withdraw,
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["wallets"] })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Retiro procesado correctamente")
      reset()
      setStep("form")
      setPending(null)
    },
    onError(err) {
      toast.error(getErrorMessage(err))
      setStep("form")
    },
  })

  function onSubmit(data: FormInput) {
    setPending(data)
    setStep("confirm")
  }

  function onConfirm() {
    if (!pending) return
    mutate({ currency: pending.currency, amount: pending.amount, description: pending.description || `Retiro a ${destination?.label}` })
  }

  return (
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <RiArrowUpCircleLine className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Retirar</h1>
              <p className="text-sm text-muted-foreground">Enviá fondos a tus cuentas bancarias</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            <div className="space-y-4">
              {step === "form" ? (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Nueva transferencia</CardTitle>
                    <CardDescription>Los fondos se acreditarán en 1–3 días hábiles.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {/* Currency */}
                      <div className="space-y-1.5">
                        <Label>Moneda</Label>
                        <Select value={currency} onValueChange={(v) => setValue("currency", v as typeof CURRENCIES[number])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                <span className="flex items-center gap-2">
                                  {c}
                                  {wallet && <span className="text-muted-foreground text-xs">— saldo: {formatCurrency(wallet.balance, c)}</span>}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount */}
                      <div className="space-y-1.5">
                        <Label>Monto</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field("amount")} />
                        </div>
                        {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
                      </div>

                      {/* Destination */}
                      <div className="space-y-1.5">
                        <Label>Destino</Label>
                        <Select value={destinationId} onValueChange={(v) => setValue("destinationId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccioná una cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedAccounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                <span className="flex items-center gap-2">
                                  <RiBankLine className="size-4" />
                                  {acc.label} ···{acc.accountLast4}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.destinationId && <p className="text-destructive text-xs">{errors.destinationId.message}</p>}
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <Label>Descripción <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Input placeholder="Pago de factura, honorarios..." {...field("description")} />
                      </div>

                      {/* Fee preview */}
                      {Number(amount) > 0 && (
                        <div className="rounded-xl bg-muted/60 p-4 space-y-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Monto</span>
                            <span>{formatCurrency(amount, currency)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Comisión (0.1%)</span>
                            <span>- {formatCurrency(fee)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Recibís</span>
                            <span className="text-primary">{formatCurrency(youReceive, currency)}</span>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full gap-2">
                        Continuar
                        <RiArrowRightLine className="size-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Confirmar retiro</CardTitle>
                    <CardDescription>Revisá los datos antes de confirmar.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="divide-y rounded-xl border">
                      {[
                        ["Monto", formatCurrency(pending!.amount, pending!.currency)],
                        ["Comisión", `- ${formatCurrency(calcFee(pending!.amount))}`],
                        ["Recibís", formatCurrency(Math.max(0, pending!.amount - calcFee(pending!.amount)), pending!.currency)],
                        ["Destino", `${destination?.label} ···${destination?.accountLast4}`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between px-4 py-3 text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                        Volver
                      </Button>
                      <Button className="flex-1" disabled={isPending} onClick={onConfirm}>
                        {isPending ? "Procesando…" : "Confirmar retiro"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Withdrawal history */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Historial de retiros</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {txLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                          <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : txData?.data.length === 0 ? (
                    <div className="py-10 text-center">
                      <RiArrowUpCircleLine className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No hay retiros aún.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {txData?.data.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium">{tx.description || "Retiro"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(tx.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-destructive">-{formatCurrency(tx.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  )
}
