import { api } from "./axios"

export type KycStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED"

export interface KycInfo {
  status: KycStatus
  documentType?: string
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  lastName?: string
  avatar?: string
  phone?: string
  createdAt?: string
  authProvider?: string
  twoFactorEnabled?: boolean
  emailConfirm?: boolean
  kyc?: KycInfo | null
}

export interface Session {
  id: string
  userId: string
  userAgent?: string
  createdAt: string
  lastUsedAt?: string
}

export async function getSessions(): Promise<Session[]> {
  const { data } = await api.get<Session[]>("/sessions")
  return data
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/sessions/${id}`)
}

export async function revokeAllSessions(): Promise<void> {
  await api.delete("/sessions")
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me")
  return data
}

export async function updateMe(payload: { name?: string; lastName?: string; phone?: string }): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/users/me", payload)
  return data
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  requiresTwoFactor?: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  name?: string
  lastName?: string
  phone?: string
  country?: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<void> {
  await api.post("/auth/register", payload)
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email })
}

export async function resetPassword(payload: {
  email: string
  code: string
  password: string
}): Promise<void> {
  await api.post("/auth/reset-password", payload)
}

export async function verifyTwoFactor(code: string): Promise<void> {
  await api.post("/auth/2fa/verify", { code })
}
