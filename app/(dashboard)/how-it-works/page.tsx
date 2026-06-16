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
    title: "Client pays you",
    description:
      "Your customer sends funds via ACH, wire transfer, or crypto from their bank or wallet.",
    color: "bg-[#7C3AED]/10 text-[#7C3AED]",
  },
  {
    icon: RiArrowDownLine,
    title: "Funds arrive at PayFlow",
    description:
      "We receive the payment on your behalf. Funds are held in a segregated account with our partner banks.",
    color: "bg-[#7C3AED]/10 text-[#7C3AED]",
  },
  {
    icon: RiTimeLine,
    title: "Settlement period",
    description:
      "Depending on the payment method, funds settle within 1–3 business days. Crypto and wire transfers settle fastest.",
    color: "bg-[#E5A500]/10 text-[#E5A500]",
  },
  {
    icon: RiCheckLine,
    title: "Balance updates",
    description:
      "Once settled, your PayFlow balance is updated. You can see the full lifecycle in the transaction timeline.",
    color: "bg-[#22C55E]/10 text-[#22C55E]",
  },
  {
    icon: RiArrowUpLine,
    title: "Withdraw whenever",
    description:
      "Move your funds to your local bank account or external wallet. No minimums, no hidden fees.",
    color: "bg-[#7C3AED]/10 text-[#7C3AED]",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              The flow explained
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            How it works
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            From client payment to your wallet — understand every step of the money flow.
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
            Entity Model
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "User", description: "Your account with KYC, settings, and profile." },
              { name: "Account", description: "Holds your balance across supported currencies." },
              { name: "Transaction", description: "Every inflow and outflow recorded with full state history." },
              { name: "Withdrawal", description: "External transfer to your bank or wallet." },
            ].map((entity) => (
              <div key={entity.name} className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <p className="text-sm font-bold text-[#7C3AED]">{entity.name}</p>
                <p className="text-xs text-[#666666] mt-1">{entity.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/depositar"
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-colors"
          >
            <RiArrowDownLine className="size-4" />
            Make your first deposit
          </Link>
        </div>

      </div>
    </div>
  )
}
