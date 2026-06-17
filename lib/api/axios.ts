import axios, { type AxiosError, type AxiosInstance } from "axios"

interface QueueItem {
  resolve: () => void
  reject: (error: unknown) => void
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired")
    this.name = "SessionExpiredError"
  }
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
    withCredentials: true,
    timeout: 30_000,
  })

  let isRefreshing = false
  let failedQueue: QueueItem[] = []

  function processQueue(error: unknown) {
    failedQueue.forEach(({ resolve, reject }) => {
      error ? reject(error) : resolve()
    })
    failedQueue = []
  }

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean }

      if (!originalRequest) return Promise.reject(error)

      const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh")
      const isLoginEndpoint = originalRequest.url?.includes("/auth/login")

      if (error.response?.status !== 401 || originalRequest._retry || isRefreshEndpoint || isLoginEndpoint) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => client(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await client.post("/auth/refresh")
        processQueue(null)
        return client(originalRequest)
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          processQueue(null)

          try {
            await client.post("/auth/logout")
          } catch (logoutError) {
            console.warn("[api] logout after refresh failure:", logoutError)
          }

          window.location.href = "/login?expired=1"
          return new Promise<never>(() => {})
        }

        processQueue(refreshError)
        return Promise.reject(new SessionExpiredError())
      } finally {
        isRefreshing = false
      }
    },
  )

  return client
}

export const api = createApiClient()
