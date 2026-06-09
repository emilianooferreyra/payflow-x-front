import { isAxiosError } from "axios"

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message
    if (Array.isArray(msg)) return msg.join(", ")
    if (typeof msg === "string") return msg
  }
  if (error instanceof Error) return error.message
  return fallback
}
