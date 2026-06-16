"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReceivingAccountCard } from "./_components/receiving-account-card"
import { toast } from "sonner"
import { RiBankLine, RiBankCardLine, RiEarthLine, RiArrowRightLine, RiCheckLine, RiTimeLine, RiCheckboxCircleLine } from "@remixicon/react"
import { formatCurrency } from "@/lib/utils"
import { bankingInstructions } from "@/lib/mock/banking"
import QRCode from "qrcode"

type FundingMethod = "bank" | "card" | "international"
type Step = 1 | 2 | 3 | 4

interface MethodCardProps {
  icon: typeof RiBankLine
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

function MethodCard({ icon: Icon, title, description, selected, onClick }: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 p-6 transition-all duration-200 ${
        selected
          ? "border-[#7C3AED] bg-[#F5F3FF]"
          : "border-[#E5E5E5] bg-white hover:border-[#d0d0d0] hover:bg-gray-50"
      }`}
    >
      {selected && (
        <span className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-[#7C3AED]">
          <RiCheckLine className="size-3.5 text-[#111111]" />
        </span>
      )}
      <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F5F5] mb-4">
        <Icon className="size-5 text-[#666666]" />
      </div>
      <h3 className="text-base font-semibold text-[#111111] mb-1">{title}</h3>
      <p className="text-sm text-[#666666] leading-relaxed">{description}</p>
    </button>
  )
}

const steps = [
  { step: 1, label: "Method" },
  { step: 2, label: "Amount" },
  { step: 3, label: "Instructions" },
  { step: 4, label: "Tracking" },
] as const

export default function DepositarPage() {
  const [step, setStep] = useState<Step>(1)
  const [method, setMethod] = useState<FundingMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [transferStatus, setTransferStatus] = useState<"Pending" | "Completed">("Pending")
  const qrRef = useRef<HTMLCanvasElement>(null)

  const accountNumber = bankingInstructions[0].fields[1].value
  const routingNumber = bankingInstructions[0].fields[2].value
  const qrData = `payflow://deposit/USD?account=${accountNumber}&routing=${routingNumber}&amount=${amount}`

  useEffect(() => {
    if (step !== 4) return
    setTransferStatus("Pending")
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrData, { width: 160, margin: 1, color: { dark: "#111111" } })
    }
    const timer = setTimeout(() => {
      setTransferStatus("Completed")
      toast.success("Your transfer has been completed! The funds are now in your account.")
    }, 8000)
    return () => clearTimeout(timer)
  }, [step])

  function getMethodTitle() {
    switch (method) {
      case "bank": return "Bank Transfer"
      case "card": return "Debit Card"
      case "international": return "International Transfer"
      default: return ""
    }
  }

  function getMethodDescription() {
    switch (method) {
      case "bank": return "Transfer via ACH or domestic wire from your US bank account."
      case "card": return "Instant funding using your debit card."
      case "international": return "Receive funds via SWIFT from outside the US."
      default: return ""
    }
  }

  function getArrival() {
    switch (method) {
      case "bank": return "1–3 business days"
      case "card": return "Instant"
      case "international": return "1–2 business days"
      default: return ""
    }
  }

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-2xl px-6 py-10 lg:px-8 lg:py-14">

        {/* ─── Progress ─── */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              Step {step} of 4
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            {step === 1 && "Add Money"}
            {step === 2 && "Enter amount"}
            {step === 3 && "Funding instructions"}
            {step === 4 && "Track your transfer"}
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            {step === 1 && "Choose how you want to fund your account."}
            {step === 2 && `How much would you like to add via ${getMethodTitle().toLowerCase()}?`}
            {step === 3 && "Use these details to send funds from your other account."}
            {step === 4 && "Your deposits and their current status."}
          </p>

          {/* Steps indicator */}
          <div className="mt-7 flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  s.step <= step
                    ? "bg-[#7C3AED] text-[#111111]"
                    : "bg-[#F5F5F5] text-[#666666]"
                }`}>
                  {s.step < step ? (
                    <RiCheckLine className="size-4" />
                  ) : (
                    s.step
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-10 sm:w-16 mx-1 rounded-full transition-colors ${
                    s.step < step ? "bg-[#7C3AED]" : "bg-[#E5E5E5]"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Step 1: Funding Method ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MethodCard
                icon={RiBankLine}
                title="Bank Transfer"
                description="ACH or domestic wire from your US bank."
                selected={method === "bank"}
                onClick={() => setMethod("bank")}
              />
              <MethodCard
                icon={RiBankCardLine}
                title="Debit Card"
                description="Instant funding with your debit card."
                selected={method === "card"}
                onClick={() => setMethod("card")}
              />
              <MethodCard
                icon={RiEarthLine}
                title="International"
                description="SWIFT transfer from outside the US."
                selected={method === "international"}
                onClick={() => setMethod("international")}
              />
            </div>
            <Button
              disabled={!method}
              onClick={() => setStep(2)}
              className="w-full h-14 gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue
              <RiArrowRightLine className="size-4" />
            </Button>
          </div>
        )}

        {/* ─── Step 2: Amount ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#111111]">
                  Amount in USD
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] text-lg font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-[#E5E5E5] rounded-xl h-16 pl-9 pr-4 text-2xl font-bold tabular-nums tracking-tight bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#7C3AED] focus-visible:ring-[3px] focus-visible:ring-[#7C3AED]/15 placeholder:text-[#D4D4D4]"
                  />
                </div>
              </div>

              {amount && Number(amount) > 0 && (
                <div className="mt-6 rounded-xl bg-[#F5F5F5] p-4 space-y-2">
                  <div className="flex justify-between text-sm text-[#666666]">
                    <span>Method</span>
                    <span className="font-medium text-[#111111]">{getMethodTitle()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#666666]">
                    <span>Arrival time</span>
                    <span className="font-medium text-[#7C3AED]">{getArrival()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#666666]">
                    <span>Fee</span>
                    <span className="font-medium text-[#111111]">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#111111] border-t border-[#E5E5E5] pt-2">
                    <span>You add</span>
                    <span className="text-[#7C3AED]">${formatCurrency(Number(amount))} USD</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-14 gap-2 rounded-xl border-2 border-[#E5E5E5] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
              >
                Back
              </Button>
              <Button
                disabled={!amount || Number(amount) <= 0}
                onClick={() => setStep(3)}
                className="flex-1 h-14 gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
                <RiArrowRightLine className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Funding Instructions ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F5F5]">
                  {method === "card" ? (
                    <RiBankCardLine className="size-5 text-[#666666]" />
                  ) : (
                    <RiBankLine className="size-5 text-[#666666]" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#111111]">{getMethodTitle()}</p>
                  <p className="text-sm text-[#666666]">
                    {amount ? `$${formatCurrency(Number(amount))} USD` : ""} &middot; {getArrival()}
                  </p>
                </div>
              </div>

              {method === "card" ? (
                <div className="rounded-xl bg-[#F5F5F5] p-5 text-center">
                  <RiBankCardLine className="mx-auto size-8 text-[#666666]/40 mb-2" />
                  <p className="text-sm text-[#666666] mb-3">Debit card funding coming soon.</p>
                  <p className="text-xs text-[#666666]">For now, use bank transfer or international wire.</p>
                </div>
              ) : (
                <ReceivingAccountCard />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-14 gap-2 rounded-xl border-2 border-[#E5E5E5] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  toast.success("Transfer registered! We'll notify you when the funds arrive.")
                  setStep(4)
                }}
                className="flex-1 h-14 gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all"
              >
                I&apos;ve made the transfer
                <RiArrowRightLine className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Success + Summary ─── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Single cohesive card */}
            <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white overflow-hidden">
              {/* Success header */}
              <div className="bg-[#F5F3FF] px-8 py-8 text-center border-b border-[#E5E5E5]">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#7C3AED] mx-auto mb-4">
                  <RiCheckboxCircleLine className="size-7 text-[#111111]" />
                </div>
                <h2 className="text-2xl font-bold text-[#111111] mb-1">Transfer initiated</h2>
                <p className="text-[#666666]">
                  Your funds are on the way. We&apos;ll notify you once they arrive.
                </p>
              </div>

              {/* Body */}
              <div className="px-8 py-7">
                {/* QR */}
                <div className="flex justify-center mb-7">
                  <div className="rounded-xl border-2 border-[#E5E5E5] p-3">
                    <canvas ref={qrRef} className="block" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666666]">Method</span>
                    <span className="text-sm font-semibold text-[#111111]">{getMethodTitle()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666666]">Amount</span>
                    <span className="text-sm font-semibold text-[#111111]">${formatCurrency(Number(amount))} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666666]">Estimated arrival</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#7C3AED]">
                      <RiTimeLine className="size-3.5" />
                      {getArrival()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                    <span className="text-sm text-[#666666]">Status</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      transferStatus === "Completed"
                        ? "border-[#7C3AED]/30 bg-[#F5F3FF] text-[#7C3AED]"
                        : "border-[#E5A500]/30 bg-[#FFF8E5] text-[#E5A500]"
                    }`}>
                      {transferStatus === "Completed" ? (
                        <RiCheckboxCircleLine className="size-3" />
                      ) : (
                        <RiTimeLine className="size-3" />
                      )}
                      {transferStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => { setStep(1); setMethod(null); setAmount("") }}
              className="w-full h-14 gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all"
            >
              Start a new deposit
              <RiArrowRightLine className="size-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
