import { api } from "./axios"

export interface Wallet {
  id: string
  currency: string
  balance: string
}

export async function getWallets(): Promise<Wallet[]> {
  const { data } = await api.get<Wallet[]>("/wallet")
  return data
}

export async function deposit(payload: {
  currency: string
  amount: number
  description?: string
}): Promise<void> {
  await api.post("/wallet/deposit", payload)
}

export async function withdraw(payload: {
  currency: string
  amount: number
  description?: string
}): Promise<void> {
  await api.post("/wallet/withdraw", payload)
}

export async function exchange(payload: {
  fromCurrency: string
  toCurrency: string
  amount: number
}): Promise<void> {
  await api.post("/wallet/exchange", payload)
}
