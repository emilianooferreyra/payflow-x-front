import { api } from "./axios"

export interface Beneficiary {
  id: string
  userId: string
  alias: string
  beneficiaryType: "CBU" | "CVU" | "ALIAS" | "SWIFT" | "ACCOUNT_NUMBER"
  accountNumber: string
  bankName: string | null
  currency: string
  country: string
  documentType: string | null
  documentNumber: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBeneficiaryPayload {
  alias: string
  beneficiaryType: Beneficiary["beneficiaryType"]
  accountNumber: string
  bankName?: string
  currency: string
  country?: string
  documentType?: string
  documentNumber?: string
}

export type UpdateBeneficiaryPayload = Partial<CreateBeneficiaryPayload>

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  const { data } = await api.get<Beneficiary[]>("/beneficiaries")
  return data
}

export async function getBeneficiary(id: string): Promise<Beneficiary> {
  const { data } = await api.get<Beneficiary>(`/beneficiaries/${id}`)
  return data
}

export async function createBeneficiary(payload: CreateBeneficiaryPayload): Promise<Beneficiary> {
  const { data } = await api.post<Beneficiary>("/beneficiaries", payload)
  return data
}

export async function updateBeneficiary(id: string, payload: UpdateBeneficiaryPayload): Promise<Beneficiary> {
  const { data } = await api.patch<Beneficiary>(`/beneficiaries/${id}`, payload)
  return data
}

export async function deleteBeneficiary(id: string): Promise<void> {
  await api.delete(`/beneficiaries/${id}`)
}
