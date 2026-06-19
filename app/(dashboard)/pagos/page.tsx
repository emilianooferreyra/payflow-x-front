"use client"

import { toast } from "sonner"
import {
  RiCheckLine,
  RiBankCardLine,
  RiAddLine,
  RiShieldLine,
} from "@remixicon/react"

const PLAN_FEATURES = [
  "Billetera en USD Digital",
  "Rendimientos automáticos al 3.65% APY",
  "Transacciones ilimitadas",
  "Acceso a inversiones",
  "Soporte por email",
]

export default function PagosPage() {
  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">

        {/* ─── Page Header ─── */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide">
              PAGOS
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Pagos
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Gestioná tu plan, métodos de pago e historial de facturación.
          </p>
        </div>

        {/* Plan actual */}
        <div className="mb-14">
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">
              Plan actual
            </h3>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-[#111111]">PayFlow Free</p>
                  <span className="inline-flex items-center rounded-full bg-[#059669]/10 px-2 py-0.5 text-xs font-medium text-[#059669]">
                    Activo
                  </span>
                </div>
                <p className="text-sm text-[#666666]">Sin costo mensual</p>
              </div>
              <button
                onClick={() => toast.info("Próximamente")}
                className="h-9 rounded-xl border-2 border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
              >
                Actualizar plan
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {PLAN_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <RiCheckLine className="size-4 text-[#059669] shrink-0" />
                  <span className="text-sm text-[#666666]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="mb-14">
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase">
                Métodos de pago
              </h3>
              <button
                onClick={() => toast.info("Próximamente")}
                className="h-9 rounded-xl border-2 border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all inline-flex items-center gap-1.5"
              >
                <RiAddLine className="size-3.5" />
                Agregar
              </button>
            </div>
            <p className="text-sm text-[#666666] mb-5">
              Métodos de pago para suscripciones y servicios premium.
            </p>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F5F5]">
                <RiBankCardLine className="size-5 text-[#666666]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111111]">Sin métodos de pago</p>
                <p className="text-xs text-[#666666] mt-0.5">
                  Agregá una tarjeta para acceder a planes premium.
                </p>
              </div>
              <button
                onClick={() => toast.info("Próximamente")}
                className="h-9 gap-1.5 rounded-xl bg-white border-2 border-[#111111] px-4 text-sm font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all inline-flex items-center"
              >
                <RiAddLine className="size-4" />
                Agregar tarjeta
              </button>
            </div>
          </div>
        </div>

        {/* Historial de facturación */}
        <div className="mb-14">
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">
              Historial de facturación
            </h3>
            <p className="text-sm text-[#666666] mb-5">
              Facturas y recibos de tus pagos anteriores.
            </p>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F5F5]">
                <RiShieldLine className="size-5 text-[#666666]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111111]">Sin historial de pagos</p>
                <p className="text-xs text-[#666666] mt-0.5">
                  Tus facturas aparecerán aquí una vez que tengas un plan de pago.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
