import { RiMailLine, RiMessage2Line, RiBookOpenLine } from "@remixicon/react"
import Link from "next/link"

const channels = [
  {
    icon: RiMessage2Line,
    title: "Live chat",
    description: "Chat with our team in real time.",
    action: "Start chat",
    href: "#",
  },
  {
    icon: RiMailLine,
    title: "Email",
    description: "Send us a message and we'll get back within 24h.",
    action: "support@payflow.io",
    href: "mailto:support@payflow.io",
  },
  {
    icon: RiBookOpenLine,
    title: "Help center",
    description: "Guides, FAQs, and documentation.",
    action: "Visit help center",
    href: "/how-it-works",
  },
]

export default function SoportePage() {
  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              We're here to help
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Soporte
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Get in touch with our team or find answers on your own.
          </p>
        </div>

        {/* Channels */}
        <div className="space-y-4">
          {channels.map((channel) => (
            <Link
              key={channel.title}
              href={channel.href}
              className="flex items-center gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-6 hover:border-[#d0d0d0] hover:shadow-sm transition-all group"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10 group-hover:bg-[#7C3AED]/20 transition-colors">
                <channel.icon className="size-5 text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#111111]">{channel.title}</p>
                <p className="text-sm text-[#666666] mt-0.5">{channel.description}</p>
              </div>
              <span className="text-sm font-semibold text-[#7C3AED] group-hover:text-[#6D28D9]">
                {channel.action}
              </span>
            </Link>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-10 rounded-2xl border border-[#E5E5E5] bg-white p-7 lg:p-8">
          <h2 className="text-sm font-semibold text-[#111111] tracking-wide uppercase mb-5">
            Quick answers
          </h2>
          <div className="space-y-4">
            {[
              { q: "How long do deposits take?", a: "ACH transfers settle in 3–5 business days. Wire transfers and crypto are usually same-day." },
              { q: "What are the fees?", a: "Deposits are free. Withdrawals have a flat fee based on the method — see the withdrawal screen for details." },
              { q: "Which currencies are supported?", a: "USD, ARS, and USDT. More currencies coming soon." },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-[#E5E5E5] pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-[#111111]">{faq.q}</p>
                <p className="text-sm text-[#666666] mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
