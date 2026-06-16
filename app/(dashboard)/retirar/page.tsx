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
import { RiArrowUpCircleLine, RiArrowRightLine, RiArrowDownSLine, RiArrowDownLine, RiBankLine, RiAddLine } from "@remixicon/react"
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

const faqs = [
  {
    q: "How long does a withdrawal take?",
    a: "ACH transfers typically arrive within 1–3 business days. Domestic wire transfers are usually processed the same business day. International SWIFT transfers may take 1–2 business days depending on the destination bank.",
  },
  {
    q: "Are there any fees?",
    a: "There is a 0.1% fee per withdrawal (minimum $0, maximum $5). The exact fee is shown before you confirm. Receiving banks may also charge their own fees for incoming wires.",
  },
  {
    q: "Where can I see my withdrawal history?",
    a: "Your withdrawal history is displayed on this page. You can also view all your activity in the Transacciones section, where you can filter by type, currency, and date.",
  },
  {
    q: "What if my withdrawal fails?",
    a: "If a withdrawal fails, the funds are automatically returned to your PayFlow account. You'll see the failed status in your transaction history. Common reasons include incorrect account details or bank processing issues.",
  },
]

export default function RetirarPage() {
  const qc = useQueryClient()
  const [step, setStep] = useState<"form" | "confirm">("form")
  const [pending, setPending] = useState<FormInput | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide">
              Send USD to your bank accounts
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Send Money
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Transfer funds from your PayFlow account to your personal bank accounts or send payments to beneficiaries.
          </p>
        </div>

        {/* ─── Form + History ─── */}
        <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Main form */}
          <div className="space-y-4">
            {wallets && wallets.length === 0 ? (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-10 text-center">
                <RiArrowUpCircleLine className="mx-auto size-10 text-[#666666]/30 mb-4" />
                <h3 className="text-lg font-semibold text-[#111111] mb-1">No funds to withdraw</h3>
                <p className="text-sm text-[#666666] mb-5 max-w-xs mx-auto">
                  First deposit funds to your account before making a withdrawal.
                </p>
                <Link
                  href="/depositar"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all"
                >
                  <RiArrowDownLine className="size-5" />
                  Deposit funds
                </Link>
              </div>
            ) : step === "form" ? (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-1">New transfer</h2>
                <p className="text-sm text-[#666666] mb-6">Funds are typically credited within 1–3 business days.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">Currency</Label>
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
                    <Label className="text-sm font-medium text-[#111111]">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="border-[#E5E5E5] rounded-xl pl-7 h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#7C3AED] focus-visible:ring-[3px] focus-visible:ring-[#7C3AED]/15 placeholder:text-[#D4D4D4]"
                        {...field("amount")}
                      />
                    </div>
                    {errors.amount && <p className="text-[#E5484D] text-xs">{errors.amount.message}</p>}
                  </div>

                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">Destination</Label>
                    <Select onValueChange={(v) => setValue("destinationId", v)}>
                      <SelectTrigger className="border-[#E5E5E5] rounded-xl h-14 px-4 text-base">
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                      <SelectContent sideOffset={8}>
                        {beneficiaries?.length === 0 ? (
                          <div className="p-3 text-sm text-[#666666] text-center">
                            No saved beneficiaries
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
                        Manage beneficiaries
                      </Link>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#111111]">
                      Description <span className="text-[#666666] text-xs">(optional)</span>
                    </Label>
                    <Input
                      placeholder="Invoice payment, fees..."
                      className="border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#7C3AED] focus-visible:ring-[3px] focus-visible:ring-[#7C3AED]/15 placeholder:text-[#D4D4D4]"
                      {...field("description")}
                    />
                  </div>

                  {/* Fee preview */}
                  {Number(amount) > 0 && (
                    <div className="rounded-xl bg-[#F5F5F5] p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-[#666666]">
                        <span>Amount</span>
                        <span>{formatCurrency(amount, currency)}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Fee (0.1%)</span>
                        <span>- {formatCurrency(fee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#111111] border-t border-[#E5E5E5] pt-2">
                        <span>You receive</span>
                        <span className="text-[#7C3AED]">{formatCurrency(youReceive, currency)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all"
                  >
                    Continue
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <h2 className="text-base font-semibold text-[#111111] mb-1">Confirm withdrawal</h2>
                <p className="text-sm text-[#666666] mb-6">Review the details before confirming.</p>

                <div className="divide-y divide-[#E5E5E5] rounded-xl border border-[#E5E5E5] mb-6">
                  {[
                    ["Amount", formatCurrency(pending!.amount, pending!.currency)],
                    ["Fee", `- ${formatCurrency(calcFee(pending!.amount))}`],
                    ["You receive", formatCurrency(Math.max(0, pending!.amount - calcFee(pending!.amount)), pending!.currency)],
                    ["Destination", destination ? `${destination.alias} ···${destination.accountNumber.slice(-4)}` : "—"],
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
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={onConfirm}
                    className="flex-1 h-12 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isPending ? "Processing…" : "Confirm withdrawal"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal history sidebar */}
          <div>
            <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
              <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">
                Recent withdrawals
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
                  <p className="text-sm text-[#666666]">No withdrawals yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E5]">
                  {txData?.data.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-[#111111]">{tx.description || "Withdrawal"}</p>
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

        {/* ─── FAQ ─── */}
        <div className="mb-14">
          <h2 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[#E5E5E5] rounded-2xl border-2 border-[#E5E5E5] bg-white">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-2 px-6 py-5 text-left hover:bg-[#F5F3FF] transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#111111]">{faq.q}</span>
                    <RiArrowDownSLine
                      className={`size-4 shrink-0 text-[#666666] transition-transform duration-200 ${
                        isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-[#666666] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
