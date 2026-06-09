import { api } from "./axios"

export interface ExchangeRate {
  fromCurrency: string
  toCurrency: string
  rate: string
  updatedAt: string
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const { data } = await api.get<ExchangeRate[]>("/exchange-rates/current")
  return data
}
