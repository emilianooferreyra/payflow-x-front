"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RiFileCopyLine, RiCheckLine, RiDownload2Line, RiShareForwardLine } from "@remixicon/react"
import { bankingInstructions } from "@/lib/mock/banking"

const USD_FIELDS = [
  { label: "Banco", value: bankingInstructions[0].fields[4].value },
  { label: "Titular", value: bankingInstructions[0].fields[0].value },
  { label: "Número de ruta", value: bankingInstructions[0].fields[2].value },
  { label: "Número de cuenta", value: bankingInstructions[0].fields[1].value },
  { label: "Código SWIFT / BIC", value: bankingInstructions[1].fields[2].value },
]

export function ReceivingAccountCard() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  function handleCopy(value: string, label: string) {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    toast.success(`${label} copiado`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function handleCopyAll() {
    const text = USD_FIELDS.map((f) => `${f.label}: ${f.value}`).join("\n")
    navigator.clipboard.writeText(text)
    toast.success("Datos de cuenta copiados")
  }

  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <span className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-3.5 py-1 text-xs font-semibold text-[#111111]">
          Cuenta USD Digital
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
          <RiCheckLine className="size-3.5" />
          Activa
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {USD_FIELDS.map((field) => (
          <div key={field.label} className="group">
            <p className="text-xs text-[#666666] mb-1">{field.label}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#111111]">{field.value}</p>
              <button
                type="button"
                onClick={() => handleCopy(field.value, field.label)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#666666] hover:text-[#111111] p-1"
              >
                {copiedField === field.label ? (
                  <RiCheckLine className="size-4 text-[#111111]" />
                ) : (
                  <RiFileCopyLine className="size-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
        >
          <RiFileCopyLine className="size-4" />
          Copiar todo
        </button>
        <button
          type="button"
          onClick={() => toast.info("PDF download coming soon")}
          className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
        >
          <RiDownload2Line className="size-4" />
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => toast.info("Share coming soon")}
          className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
        >
          <RiShareForwardLine className="size-4" />
          Compartir datos
        </button>
      </div>
    </div>
  )
}
