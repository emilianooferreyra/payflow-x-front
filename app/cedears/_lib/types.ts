export interface BrokerSource {
  label: string
  url: string
}

export interface BrokerTariff {
  slug: string
  name: string
  feeBuyPct: string
  feeSellPct: string
  feeMaxPct: string | null
  feeMinArs: string | null
  ivaOnFees: boolean
  subscriptionMonthlyArs: string | null
  subscriptionNotes: string | null
  custodyPctAnnual: string | null
  custodyMinMonthlyArs: string | null
  custodyNotes: string | null
  feeNotes: string | null
  sources: BrokerSource[]
  lastVerifiedAt: string
  isActive: boolean
}

export interface TariffMeta {
  marketRightsPct: number
  ivaPct: number
  marketRightsSource: BrokerSource
}

export interface TariffResponse {
  meta: TariffMeta
  brokers: BrokerTariff[]
}
