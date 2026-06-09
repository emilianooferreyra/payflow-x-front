import { api } from "./axios"

export interface Transaction {
  id: string
  type: string
  status: string
  amount: string
  currency: string
  description: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface TransactionsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TransactionsResponse {
  data: Transaction[]
  meta: TransactionsMeta
}

export async function getTransactions(params?: {
  page?: number
  limit?: number
  type?: string
  currency?: string
  dateFrom?: string
  dateTo?: string
}): Promise<TransactionsResponse> {
  const { data } = await api.get<TransactionsResponse>("/transactions", { params })
  return data
}
