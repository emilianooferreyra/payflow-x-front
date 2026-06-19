"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RiArrowLeftLine, RiArrowRightUpLine, RiUserLine, RiUserAddLine, RiBuildingLine, RiCheckLine, RiTimeLine, RiCheckboxCircleLine, RiArrowRightLine, RiArrowDownLine, RiArrowUpLine, RiHandCoinLine } from "@remixicon/react"
import { getWallets } from "@/lib/api/wallet"
import { getBeneficiaries } from "@/lib/api/beneficiaries"
import { formatCurrency } from "@/lib/utils"
import QRCode from "qrcode"

type RecipientType = "existing" | "new" | "business"
type Step = 1 | 2 | 3 | 4 | 5

interface NewRecipientData {
  name: string
  email: string
  accountNumber: string
  bankName: string
}

interface BusinessRecipientData {
  companyName: string
  taxId: string
  accountNumber: string
  bankName: string
}

const MOCK_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1, ARS: 1235.5, EUR: 0.93, USDT: 1.01, BRL: 5.45, GBP: 0.79 },
  ARS: { USD: 0.00081, EUR: 0.00075, USDT: 0.00082, BRL: 0.0044 },
  EUR: { USD: 1.08, ARS: 1330, GBP: 0.85, BRL: 5.87 },
  USDT: { USD: 0.99, ARS: 1220, EUR: 0.92, BRL: 5.4 },
}

function calcRate(from: string, to: string): number {
  return MOCK_RATES[from]?.[to] ?? 1
}

const FEE_RATE = 0.005
const FEE_MIN = 0.5
const FEE_MAX = 20

function calcFee(amount: number): number {
  return Math.min(FEE_MAX, Math.max(FEE_MIN, amount * FEE_RATE))
}

function getArrival(from: string, to: string): string {
  if (from === "USDT" || to === "USDT") return "Within minutes"
  if (from !== to) return "1–2 business days"
  return "1–3 business days"
}

const STEPS = [
  { step: 1, label: "Quién", emoji: "👤" },
  { step: 2, label: "Datos", emoji: "📋" },
  { step: 3, label: "Monto", emoji: "💰" },
  { step: 4, label: "Revisar", emoji: "✅" },
  { step: 5, label: "Listo", emoji: "🎉" },
] as const

function RecipientTypeCard({
  icon: Icon,
  title,
  description,
  emoji,
  selected,
  onClick,
}: {
  icon: typeof RiUserLine
  title: string
  description: string
  emoji: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl p-6 transition-all duration-200 ${
        selected
          ? "bg-[#111111] text-[#111111] shadow-lg shadow-[#111111]/20"
          : "bg-white text-[#111111] border-2 border-[#E5E5E5] hover:border-[#d0d0d0] hover:shadow-md"
      }`}
    >
      {selected && (
        <span className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-[#111111]">
          <RiCheckLine className="size-3.5 text-white" />
        </span>
      )}
      <span className="text-3xl mb-3 block">{emoji}</span>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className={`text-sm leading-relaxed ${selected ? "text-[#111111]/70" : "text-[#666666]"}`}>{description}</p>
    </button>
  )
}

export default function EnviarPage() {
  const [step, setStep] = useState<Step>(1)
  const [recipientType, setRecipientType] = useState<RecipientType | null>(null)
  const [existingId, setExistingId] = useState<string>("")
  const [newRecipient, setNewRecipient] = useState<NewRecipientData>({ name: "", email: "", accountNumber: "", bankName: "" })
  const [businessRecipient, setBusinessRecipient] = useState<BusinessRecipientData>({ companyName: "", taxId: "", accountNumber: "", bankName: "" })
  const [sendCurrency, setSendCurrency] = useState("USD")
  const [receiveCurrency, setReceiveCurrency] = useState("USD")
  const [sendAmount, setSendAmount] = useState("")
  const [transferStatus, setTransferStatus] = useState<"Pendiente" | "Completado">("Pendiente")
  const qrRef = useRef<HTMLCanvasElement>(null)

  const { data: wallets } = useQuery({ queryKey: ["wallets"], queryFn: getWallets })
  const { data: beneficiaries } = useQuery({ queryKey: ["beneficiaries"], queryFn: getBeneficiaries })

  const currencies = wallets?.map((w) => w.currency) ?? []
  const wallet = wallets?.find((w) => w.currency === sendCurrency)
  const selectedBeneficiary = beneficiaries?.find((b) => b.id === existingId)
  const rate = calcRate(sendCurrency, receiveCurrency)
  const fee = calcFee(Number(sendAmount))
  const recipientGets = Math.max(0, Number(sendAmount) - fee) * rate

  function getRecipientName() {
    if (recipientType === "existing" && selectedBeneficiary) return selectedBeneficiary.alias
    if (recipientType === "new") return newRecipient.name || "Nuevo destinatario"
    if (recipientType === "business") return businessRecipient.companyName || "Empresa"
    return ""
  }

  function getRecipientAccount() {
    if (recipientType === "existing" && selectedBeneficiary) return `···${selectedBeneficiary.accountNumber.slice(-4)}`
    if (recipientType === "new") return newRecipient.accountNumber ? `···${newRecipient.accountNumber.slice(-4)}` : ""
    if (recipientType === "business") return businessRecipient.accountNumber ? `···${businessRecipient.accountNumber.slice(-4)}` : ""
    return ""
  }

  const arrivalTime = getArrival(sendCurrency, receiveCurrency)

  useEffect(() => {
    if (step !== 5) return
    setTransferStatus("Pendiente")
    const qrData = `payflow://send/${sendCurrency}/${sendAmount}/${receiveCurrency}`
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrData, { width: 140, margin: 1, color: { dark: "#111111" } })
    }
    const timer = setTimeout(() => {
      setTransferStatus("Completado")
      toast.success("¡Tu transferencia se completó! El destinatario recibió los fondos.")
    }, 6000)
    return () => clearTimeout(timer)
  }, [step])

  function resetFlow() {
    setStep(1)
    setRecipientType(null)
    setExistingId("")
    setNewRecipient({ name: "", email: "", accountNumber: "", bankName: "" })
    setBusinessRecipient({ companyName: "", taxId: "", accountNumber: "", bankName: "" })
    setSendAmount("")
    setSendCurrency("USD")
    setReceiveCurrency("USD")
  }

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors mb-8 tracking-wide uppercase"
        >
          <RiArrowLeftLine className="size-3.5" />
          Inicio
        </Link>

        {/* ─── Steps indicator ─── */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                s.step === step ? "bg-[#111111] text-[#111111]" : s.step < step ? "bg-[#F5F5F5] text-[#666666]" : "text-[#666666]"
              }`}>
                <span className={`text-sm ${s.step === step ? "" : "hidden"} sm:inline`}>
                  {s.emoji}
                </span>
                <span className="text-xs font-semibold tracking-wide">{s.label}</span>
                {s.step < step && <RiCheckLine className="size-3" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 sm:w-10 h-px ${s.step < step ? "bg-[#111111]" : "bg-[#E5E5E5]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ─── Hero ─── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-[#666666] tracking-wide uppercase">
              {STEPS.find((s) => s.step === step)?.emoji} Paso {step} de 5
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            {step === 1 && <>¿A quién le<br />enviás?</>}
            {step === 2 && recipientType === "existing" && "Seleccioná un beneficiario"}
            {step === 2 && recipientType === "new" && "Datos del nuevo destinatario"}
            {step === 2 && recipientType === "business" && "Datos de la empresa"}
            {step === 3 && <>¿Cuánto<br />enviás?</>}
            {step === 4 && "Revisá tu transferencia"}
            {step === 5 && "Transferencia enviada 🎉"}
          </h1>
        </div>

        {/* ─── Step 1: Recipient Type ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <RecipientTypeCard
                icon={RiUserLine}
                title="Destinatario existente"
                description="Enviá a un beneficiario guardado."
                emoji="👤"
                selected={recipientType === "existing"}
                onClick={() => setRecipientType("existing")}
              />
              <RecipientTypeCard
                icon={RiUserAddLine}
                title="Nuevo destinatario"
                description="Agregá alguien nuevo para enviarle."
                emoji="🆕"
                selected={recipientType === "new"}
                onClick={() => setRecipientType("new")}
              />
              <RecipientTypeCard
                icon={RiBuildingLine}
                title="Empresa"
                description="Pagá a una empresa o proveedor."
                emoji="🏢"
                selected={recipientType === "business"}
                onClick={() => setRecipientType("business")}
              />
            </div>
              <button
                disabled={!recipientType}
                onClick={() => setStep(2)}
                className="w-full h-14 gap-2 rounded-2xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
              >
                Continuar
                <RiArrowRightLine className="size-4" />
            </button>
          </div>
        )}

        {/* ─── Step 2: Recipient Details ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F5F5F5] p-7">
              {recipientType === "existing" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Beneficiario</Label>
                    <Select value={existingId} onValueChange={setExistingId}>
                      <SelectTrigger className="bg-white border-0 rounded-xl h-14 px-4 text-base shadow-sm">
                        <SelectValue placeholder="Seleccioná un beneficiario" />
                      </SelectTrigger>
                      <SelectContent sideOffset={8}>
                        {beneficiaries?.length === 0 ? (
                          <div className="p-3 text-sm text-[#666666] text-center">Sin beneficiarios guardados</div>
                        ) : (
                          beneficiaries?.map((b) => (
                            <SelectItem key={b.id} value={b.id} className="py-3 text-base">
                              <span className="flex items-center gap-2">
                                {b.alias}
                                <span className="text-[#666666] text-xs">···{b.accountNumber.slice(-4)}</span>
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBeneficiary && (
                    <div className="bg-white rounded-xl p-4 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#666666]">Cuenta</span>
                        <span className="font-semibold text-[#111111]">···{selectedBeneficiary.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#666666]">Banco</span>
                        <span className="font-semibold text-[#111111]">{selectedBeneficiary.bankName ?? "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#666666]">Moneda</span>
                        <span className="font-semibold text-[#111111]">{selectedBeneficiary.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#666666]">País</span>
                        <span className="font-semibold text-[#111111]">{selectedBeneficiary.country}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recipientType === "new" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Nombre completo</Label>
                    <Input
                      placeholder="Juan Pérez"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Email</Label>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Número de cuenta</Label>
                    <Input
                      placeholder="000123456789"
                      value={newRecipient.accountNumber}
                      onChange={(e) => setNewRecipient({ ...newRecipient, accountNumber: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Nombre del banco</Label>
                    <Input
                      placeholder="Banco Santander"
                      value={newRecipient.bankName}
                      onChange={(e) => setNewRecipient({ ...newRecipient, bankName: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                </div>
              )}

              {recipientType === "business" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Nombre de la empresa</Label>
                    <Input
                      placeholder="Acme S.A."
                      value={businessRecipient.companyName}
                      onChange={(e) => setBusinessRecipient({ ...businessRecipient, companyName: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">CUIT/CUIL</Label>
                    <Input
                      placeholder="XX-XXXXXXX"
                      value={businessRecipient.taxId}
                      onChange={(e) => setBusinessRecipient({ ...businessRecipient, taxId: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Número de cuenta</Label>
                    <Input
                      placeholder="000123456789"
                      value={businessRecipient.accountNumber}
                      onChange={(e) => setBusinessRecipient({ ...businessRecipient, accountNumber: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#111111]">Nombre del banco</Label>
                    <Input
                      placeholder="Banco Galicia"
                      value={businessRecipient.bankName}
                      onChange={(e) => setBusinessRecipient({ ...businessRecipient, bankName: e.target.value })}
                      className="border border-[#E5E5E5] rounded-xl h-14 text-base bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-visible:border-[#111111] focus-visible:ring-[3px] focus-visible:ring-[#111111]/15 placeholder:text-[#D4D4D4]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-14 rounded-2xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] hover:bg-gray-50 transition-all"
              >
                Volver
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-14 gap-2 rounded-2xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] hover:bg-[#F5F5F5] transition-all inline-flex items-center justify-center"
              >
                Continuar
                <RiArrowRightLine className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Amount & Currency ─── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* You send */}
            <div className="rounded-2xl bg-[#111111] p-7">
              <Label className="text-xs font-semibold text-white/60 tracking-wide uppercase mb-4 block">Enviás</Label>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-white">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-transparent border-0 rounded-none h-auto p-0 text-4xl sm:text-5xl font-bold tracking-tight text-white placeholder:text-white/20 shadow-none focus-visible:ring-0"
                />
                <Select value={sendCurrency} onValueChange={setSendCurrency}>
                  <SelectTrigger className="bg-white/10 border-0 rounded-xl h-12 px-4 text-base font-semibold text-white shadow-sm ml-auto w-24 hover:bg-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent sideOffset={8}>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c} className="py-3 text-base">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {wallet && (
                <p className="text-xs text-white/40 mt-3">
                  Saldo: {formatCurrency(Number(wallet.balance), sendCurrency)}
                </p>
              )}
            </div>

            {/* Recipient gets */}
            <div className="rounded-2xl bg-[#F5F5F5] p-7">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-xs font-semibold text-[#666666] tracking-wide uppercase">El destinatario recibe</Label>
                <span className="text-xs text-[#666666]">{sendAmount ? `1 ${sendCurrency} ≈ ${rate.toFixed(4)} ${receiveCurrency}` : ""}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${sendAmount ? "text-[#111111]" : "text-[#666666]"}`}>
                  {sendAmount ? formatCurrency(recipientGets).replace(/\.\d+$/, "") : "—"}
                </span>
                <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
                  <SelectTrigger className="bg-white border-2 border-[#E5E5E5] rounded-xl h-12 px-4 text-base font-semibold text-[#111111] shadow-sm w-24 hover:border-[#d0d0d0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent sideOffset={8}>
                    {[...new Set(["USD", ...currencies, "ARS", "EUR", "GBP", "BRL", "USDT"])].map((c) => (
                      <SelectItem key={c} value={c} className="py-3 text-base">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fee breakdown */}
            {sendAmount && Number(sendAmount) > 0 && (
              <div className="rounded-2xl bg-[#F5F5F5] p-5 space-y-2.5 -mt-3">
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Comisión de transferencia</span>
                  <span className="font-medium text-[#111111]">{formatCurrency(fee)} {sendCurrency}</span>
                </div>
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Llegada estimada</span>
                  <span className="font-medium text-[#111111]">{arrivalTime}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-14 rounded-2xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] hover:bg-gray-50 transition-all"
              >
                Volver
              </button>
              <button
                disabled={!sendAmount || Number(sendAmount) <= 0}
                onClick={() => setStep(4)}
                className="flex-1 h-14 gap-2 rounded-2xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center"
              >
                Continuar
                <RiArrowRightLine className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Review ─── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F5F5F5] p-7">
              {/* You send */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#666666] tracking-wide uppercase">Enviás</span>
                <span className="text-xl font-bold text-[#111111]">{formatCurrency(Number(sendAmount))} {sendCurrency}</span>
              </div>
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#E5E5E5]">
                <span className="text-xs font-semibold text-[#666666] tracking-wide uppercase">Comisión</span>
                <span className="text-sm font-medium text-[#E5484D]">-{formatCurrency(fee)} {sendCurrency}</span>
              </div>

              {/* Recipient receives */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold text-[#666666] tracking-wide uppercase block mb-0.5">El destinatario recibe</span>
                  {receiveCurrency !== sendCurrency && (
                    <span className="text-xs text-[#666666]">Tipo de cambio: 1 {sendCurrency} ≈ {rate.toFixed(4)} {receiveCurrency}</span>
                  )}
                </div>
                <span className="text-2xl font-bold text-[#111111]">{formatCurrency(recipientGets)} {receiveCurrency}</span>
              </div>

              {/* Recipient info */}
              <div className="bg-white rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Destinatario</span>
                  <span className="font-semibold text-[#111111]">{getRecipientName()}</span>
                </div>
                {getRecipientAccount() && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666666]">Cuenta</span>
                    <span className="font-semibold text-[#111111]">{getRecipientAccount()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Llegada estimada</span>
                  <span className="font-semibold text-[#111111]">{arrivalTime}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-14 rounded-2xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] hover:bg-gray-50 transition-all"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  toast.success("¡Transferencia enviada! Te avisaremos cuando se complete.")
                  setStep(5)
                }}
                className="flex-1 h-14 gap-2 rounded-2xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] hover:bg-[#F5F5F5] transition-all inline-flex items-center justify-center"
              >
                Confirmar y enviar
                <RiArrowRightUpLine className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 5: Success ─── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#F5F5F5] border-2 border-[#111111] p-8 text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <h2 className="text-3xl font-bold text-[#111111] mb-2">¡Transferencia enviada!</h2>
              <p className="text-[#666666] max-w-sm mx-auto">
                Estamos procesando tu pago. El destinatario recibirá los fondos pronto.
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl bg-[#F5F5F5] p-7">
              {/* QR */}
              <div className="flex justify-center mb-6">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <canvas ref={qrRef} className="block" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">Destinatario</span>
                  <span className="text-sm font-semibold text-[#111111]">{getRecipientName()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">Monto enviado</span>
                  <span className="text-sm font-semibold text-[#111111]">{formatCurrency(Number(sendAmount))} {sendCurrency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">El destinatario recibe</span>
                  <span className="text-sm font-semibold text-[#111111]">{formatCurrency(recipientGets)} {receiveCurrency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">Estimated arrival</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#111111]">
                    <RiTimeLine className="size-3.5" />
                    {arrivalTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                  <span className="text-sm text-[#666666]">Estado</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    transferStatus === "Completado"
                      ? "bg-[#111111] text-[#111111]"
                      : "bg-[#E5A500]/15 text-[#E5A500]"
                  }`}>
                    {transferStatus === "Completado" ? (
                      <RiCheckboxCircleLine className="size-3" />
                    ) : (
                      <RiTimeLine className="size-3" />
                    )}
                    {transferStatus}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetFlow}
              className="w-full h-14 gap-2 rounded-2xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] hover:bg-[#F5F5F5] transition-all inline-flex items-center justify-center"
            >
              Enviar otro pago
              <RiArrowRightLine className="size-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
