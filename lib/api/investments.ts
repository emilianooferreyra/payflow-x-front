import { api } from "./axios"

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
}

export interface Investment {
  id: string
  quantity: string
  avgBuyPrice: string
  currentValue: string
  asset: { id: string; symbol: string; name: string; currentPrice: string }
}

export interface Portfolio {
  investments: Investment[]
  summary: PortfolioSummary
}

export interface Asset {
  id: string
  symbol: string
  name: string
  currentPrice: string
}

export async function getPortfolio(): Promise<Portfolio> {
  const { data } = await api.get<Portfolio>("/investments")
  return data
}

export async function getAssets(): Promise<Asset[]> {
  const { data } = await api.get<Asset[]>("/investments/assets")
  return data
}

export async function buyAsset(payload: { assetId: string; amount: number }): Promise<void> {
  await api.post("/investments/buy", payload)
}

export async function sellAsset(payload: { assetId: string; quantity: number }): Promise<void> {
  await api.post("/investments/sell", payload)
}
