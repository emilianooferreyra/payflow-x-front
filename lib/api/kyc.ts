import { api } from "./axios"
import type { KycInfo } from "./auth"

export async function getKycStatus(): Promise<KycInfo> {
  const { data } = await api.get<KycInfo>("/kyc/status")
  return data
}

export async function submitKyc(documentType: string): Promise<KycInfo> {
  const { data } = await api.post<KycInfo>("/kyc/submit", { documentType })
  return data
}
