import Link from "next/link"
import {
  RiBankLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckLine,
  RiTimeLine,
} from "@remixicon/react"

const steps = [
  {
    icon: RiBankLine,
    title: "El cliente te paga",
    description:
      "Tu cliente envía fondos mediante ACH, transferencia wire o cripto desde su banco o billetera.",
    color: "bg-[#111111]/10 text-[#111111]",
  },
  {
    icon: RiArrowDownLine,
    title: "Los fondos llegan a PayFlow",
    description:
      "Recibimos el pago en tu nombre. Los fondos se mantienen en una cuenta segregada con nuestros bancos asociados.",
    color: "bg-[#111111]/10 text-[#111111]",
  },
  {
    icon: RiTimeLine,
    title: "Período de liquidación",
    description:
      "Según el método de pago, los fondos se liquidan en 1 a 3 días hábiles. Las transferencias crypto y wire son las más rápidas.",
    color: "bg-[#E5A500]/10 text-[#E5A500]",
  },
  {
    icon: RiCheckLine,
    title: "Actualización de saldo",
    description:
      "Una vez liquidado, tu saldo de PayFlow se actualiza. Podés ver el ciclo completo en la línea de tiempo de transacciones.",
    color: "bg-[#22C55E]/10 text-[#22C55E]",
  },
  {
    icon: RiArrowUpLine,
    title: "Retirá cuando quieras",
    description:
      "Mové tus fondos a tu cuenta bancaria local o billetera externa. Sin mínimos, sin comisiones ocultas.",
    color: "bg-[#111111]/10 text-[#111111]",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              El flujo explicado
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Cómo funciona
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Desde el pago del cliente hasta tu billetera — entendé cada paso del flujo de dinero.
          </p>
        </div>

        {/* Flow steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-[#E5E5E5]" />

          <div className="space-y-10">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1
              return (
                <div key={step.title} className="relative flex items-start gap-5">
                  {/* Icon circle */}
                  <div className={`relative z-10 flex size-[46px] shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                    <step.icon className="size-5" />
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-[#111111]">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-[#666666] leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Entity model */}
        <div className="mt-16 rounded-2xl border border-[#E5E5E5] bg-white p-7 lg:p-8">
          <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase mb-5">
            Modelo de entidades
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "User", description: "Tu cuenta con KYC, configuración y perfil." },
              { name: "Account", description: "Mantiene tu saldo en las monedas disponibles." },
              { name: "Transaction", description: "Cada ingreso y egreso registrado con historial completo de estados." },
              { name: "Withdrawal", description: "Transferencia externa a tu banco o billetera." },
            ].map((entity) => (
              <div key={entity.name} className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <p className="text-sm font-bold text-[#111111]">{entity.name}</p>
                <p className="text-xs text-[#666666] mt-1">{entity.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/depositar"
            className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 py-3 text-sm font-semibold text-[#111111] hover:bg-[#F5F5F5] transition-colors"
          >
            <RiArrowDownLine className="size-4" />
            Hacé tu primer depósito
          </Link>
        </div>

      </div>
    </div>
  )
}
