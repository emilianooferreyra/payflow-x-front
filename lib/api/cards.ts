import { api } from "./axios"

export interface Card {
  id: string
  type: string
  maskedNumber: string
  expiresAt: string
  network: string | null
  issuer: string | null
  isActive: boolean
  isFrozen: boolean
  spendingLimit: string | null
}

export async function getCards(): Promise<Card[]> {
  const { data } = await api.get<Card[]>("/cards")
  return data
}

export async function freezeCard(id: string): Promise<Card> {
  const { data } = await api.patch<Card>(`/cards/${id}/freeze`)
  return data
}

export async function unfreezeCard(id: string): Promise<Card> {
  const { data } = await api.patch<Card>(`/cards/${id}/unfreeze`)
  return data
}
