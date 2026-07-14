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
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    failedQueue = []
  }

  // CSRF double-submit: el backend exige x-csrf-token en toda mutación.
  // El token se obtiene una vez de /auth/csrf-token (SkipCsrf) y se cachea;
  // si el backend lo invalida (403), se refresca y se reintenta una vez.
  const MUTATING_METHODS = ["post", "put", "patch", "delete"]
  let csrfToken: string | null = null

  async function fetchCsrfToken(): Promise<string> {
    const { data } = await client.get<{ token: string }>("/auth/csrf-token")
    csrfToken = data.token
    return csrfToken
  }

  client.interceptors.request.use(async (config) => {
    const method = (config.method ?? "get").toLowerCase()
    if (MUTATING_METHODS.includes(method) && !config.headers["x-csrf-token"]) {
      config.headers["x-csrf-token"] = csrfToken ?? (await fetchCsrfToken())
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean
        _csrfRetry?: boolean
      }

      if (!originalRequest) return Promise.reject(error)

      const isCsrfError =
        error.response?.status === 403 &&
        (error.response.data as { message?: string })?.message === "Invalid CSRF token"

      if (isCsrfError && !originalRequest._csrfRetry) {
        originalRequest._csrfRetry = true
        originalRequest.headers["x-csrf-token"] = await fetchCsrfToken()
        return client(originalRequest)
      }

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
