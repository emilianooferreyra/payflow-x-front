import type { BrokerTariff, TariffResponse } from "./types"

export interface CostBreakdown {
  slug: string
  name: string
  commissionBuy: number
  commissionSell: number
  ivaOnCommissions: number
  marketRights: number
  ivaOnMarketRights: number
  subscription: number
  total: number
  effectivePct: number
  isFromRange: boolean
  broker: BrokerTariff
}

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * Costo total "ida y vuelta" (compra + venta) por broker, plan base.
 * Simplificaciones v1 declaradas en la UI:
 * - La venta se calcula sobre el mismo monto que la compra.
 * - Brokers con rango de comisión (PPI) se calculan con el mínimo ("desde").
 * - Suscripciones mensuales (IEB+) se atribuyen al mes de compra y al de venta.
 */
export function computeCosts(
  tariff: TariffResponse,
  amountArs: number,
): CostBreakdown[] {
  const ivaFactor = tariff.meta.ivaPct / 100
  const rightsRate = tariff.meta.marketRightsPct / 100

  return tariff.brokers
    .map((broker) => {
      const commissionBuy = amountArs * (Number(broker.feeBuyPct) / 100)
      const commissionSell = amountArs * (Number(broker.feeSellPct) / 100)
      const ivaOnCommissions = broker.ivaOnFees
        ? (commissionBuy + commissionSell) * ivaFactor
        : 0

      const marketRights = amountArs * rightsRate * 2
      const ivaOnMarketRights = marketRights * ivaFactor

      const monthlySubscription = broker.subscriptionMonthlyArs
        ? Number(broker.subscriptionMonthlyArs)
        : 0
      const subscription = monthlySubscription * (1 + ivaFactor) * 2

      const total =
        commissionBuy +
        commissionSell +
        ivaOnCommissions +
        marketRights +
        ivaOnMarketRights +
        subscription

      return {
        slug: broker.slug,
        name: broker.name,
        commissionBuy: round2(commissionBuy),
        commissionSell: round2(commissionSell),
        ivaOnCommissions: round2(ivaOnCommissions),
        marketRights: round2(marketRights),
        ivaOnMarketRights: round2(ivaOnMarketRights),
        subscription: round2(subscription),
        total: round2(total),
        effectivePct: round2((total / amountArs) * 100),
        isFromRange: broker.feeMaxPct != null,
        broker,
      }
    })
    .sort((a, b) => a.total - b.total)
}
