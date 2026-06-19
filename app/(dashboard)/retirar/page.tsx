"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RiArrowUpCircleLine, RiArrowRightLine, RiArrowDownLine, RiBankLine, RiAddLine } from "@remixicon/react"
import { getWallets } from "@/lib/api/wallet"
import { withdraw } from "@/lib/api/wallet"
import { getTransactions } from "@/lib/api/transactions"
import { getBeneficiaries } from "@/lib/api/beneficiaries"
import { getErrorMessage } from "@/lib/api/error"
import { formatCurrency } from "@/lib/utils"

const FEE_RATE = 0.001
const FEE_MIN = 0
const FEE_MAX = 5

function calcFee(amount: number) {
  return Math.min(FEE_MAX, Math.max(FEE_MIN, amount * FEE_RATE))
}

const schema = z.object({
  currency: z.string(),
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
  const { data: beneficiaries } = useQuery({ queryKey: ["beneficiaries"], queryFn: getBeneficiaries })
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", 1, "", "WITHDRAW"],
    queryFn: () => getTransactions({ page: 1, limit: 10, type: "WITHDRAW" }),
  })

  const { register: field, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.input<typeof schema>, unknown, FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD" },
  })

  const currencies = wallets?.map((w) => w.currency) ?? []

  const currency = watch("currency") || (currencies[0] ?? "")
  const amount = Number(watch("amount")) || 0
  const destinationId = watch("destinationId")

  const wallet = wallets?.find((w) => w.currency === currency)
  const fee = calcFee(Number(amount))
  const youReceive = Math.max(0, Number(amount) - fee)
  const destination = beneficiaries?.find((a) => a.id === destinationId)

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
    mutate({ currency: pending.currency, amount: pending.amount, description: pending.description || `Retiro a ${destination?.alias}` })
  }

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">

        {/* ─── Page Header ─── */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide">
              Envianos USD a tus cuentas bancarias
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Enviar dinero
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Transferí fondos desde tu cuenta de PayFlow a tus cuentas bancarias personales o realizá pagos a beneficiarios.
          </p>
        </div>

        {/* ─── Form + History ─── */}
        <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Main form */}
          <div className="space-y-4">
            {wallets && wallets.length === 0 ? (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-10 text-center">
                <RiArrowUpCircleLine className="mx-auto size-10 text-[#666666]/30 mb-4" />
                <h3 className="text-lg font-semibold text-[#111111] mb-1">Sin fondos para retirar</h3>
                <p className="text-sm text-[#666666] mb-5 max-w-xs mx-auto">
                  Primero depositá fondos en tu cuenta antes de hacer un retiro.
                </p>
                <Link
                  href="/depositar"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all"
                >
                  <RiArrowDownLine className="size-5" />
                  Depositar fondos
                </Link>
              </div>
            ) : step === "form" ? (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-1">Nueva transferencia</h2>
                <p className="text-sm text-[#666666] mb-6">Los fondos suelen acreditarse en 1 a 3 días hábiles.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">Moneda</Label>
                    <Select value={currency} onValueChange={(v) => setValue("currency", v)}>
                      <SelectTrigger className="border-[#E5E5E5] rounded-xl h-14 px-4 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent sideOffset={8}>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c} className="py-3 text-base">
                            <span className="flex items-center gap-2">
                              {c}
                              <span className="text-[#666666] text-xs">— balance: {formatCurrency(wallet?.balance ?? 0, c)}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">Monto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="border-[#E5E5E5] rounded-xl pl-7 h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                        {...field("amount")}
                      />
                    </div>
                    {errors.amount && <p className="text-[#E5484D] text-xs">{errors.amount.message}</p>}
                  </div>

                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">Destino</Label>
                    <Select onValueChange={(v) => setValue("destinationId", v)}>
                      <SelectTrigger className="border-[#E5E5E5] rounded-xl h-14 px-4 text-base">
                        <SelectValue placeholder="Seleccioná una cuenta" />
                      </SelectTrigger>
                      <SelectContent sideOffset={8}>
                        {beneficiaries?.length === 0 ? (
                          <div className="p-3 text-sm text-[#666666] text-center">
                            Sin beneficiarios guardados
                          </div>
                        ) : (
                          beneficiaries?.map((b) => (
                            <SelectItem key={b.id} value={b.id} className="py-3 text-base">
                              <span className="flex items-center gap-2">
                                <RiBankLine className="size-4" />
                                {b.alias} ···{b.accountNumber?.slice(-4) ?? "—"}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between">
                      {errors.destinationId && <p className="text-[#E5484D] text-xs">{errors.destinationId.message}</p>}
                      <Link
                        href="/beneficiaries"
                        className="text-xs font-semibold text-[#666666] hover:text-[#111111] flex items-center gap-1 transition-colors ml-auto"
                      >
                        <RiAddLine className="size-3" />
                        Gestionar beneficiarios
                      </Link>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">
                      Descripción <span className="text-[#666666] text-xs">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Invoice payment, fees..."
                      className="border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                      {...field("description")}
                    />
                  </div>

                  {/* Fee preview */}
                  {Number(amount) > 0 && (
                    <div className="rounded-xl bg-[#F5F5F5] p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-[#666666]">
                        <span>Monto</span>
                        <span>{formatCurrency(amount, currency)}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Comisión (0,1%)</span>
                        <span>- {formatCurrency(fee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#111111] border-t border-[#E5E5E5] pt-2">
                        <span>Recibís</span>
                        <span className="text-[#111111]">{formatCurrency(youReceive, currency)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all"
                  >
                    Continuar
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-1">Confirmar retiro</h2>
                <p className="text-sm text-[#666666] mb-6">Revisá los detalles antes de confirmar.</p>

                <div className="divide-y divide-[#E5E5E5] rounded-xl border border-[#E5E5E5] mb-6">
                  {[
                    ["Monto", formatCurrency(pending!.amount, pending!.currency)],
                    ["Comisión", `- ${formatCurrency(calcFee(pending!.amount))}`],
                    ["Recibís", formatCurrency(Math.max(0, pending!.amount - calcFee(pending!.amount)), pending!.currency)],
                    ["Destino", destination ? `${destination.alias} ···${destination.accountNumber.slice(-4)}` : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-[#666666]">{label}</span>
                      <span className="font-medium text-[#111111]">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex-1 h-12 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={onConfirm}
                    className="flex-1 h-12 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isPending ? "Procesando…" : "Confirmar retiro"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal history sidebar */}
          <div>
            <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
              <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">
                Retiros recientes
              </h3>

              {txLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-32 bg-[#F5F5F5]" />
                      <Skeleton className="h-4 w-20 bg-[#F5F5F5]" />
                    </div>
                  ))}
                </div>
              ) : txData?.data.length === 0 ? (
                <div className="py-10 text-center">
                  <RiArrowUpCircleLine className="mx-auto size-8 text-[#666666]/30 mb-2" />
                  <p className="text-sm text-[#666666]">Sin retiros aún</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E5]">
                  {txData?.data.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-[#111111]">{tx.description || "Retiro"}</p>
                        <p className="text-xs text-[#666666] mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#E5484D]">-{formatCurrency(tx.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
