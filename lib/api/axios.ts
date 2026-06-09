import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
  withCredentials: true,
})

let isRefreshing = false
let queue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function flushQueue(error: unknown) {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(undefined),
  )
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isRefreshEndpoint = original.url?.includes("/auth/refresh")
    const isLoginEndpoint = original.url?.includes("/auth/login")

    if (error.response?.status !== 401 || original._retry || isRefreshEndpoint || isLoginEndpoint) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then(() => api(original))
    }

    original._retry = true
    isRefreshing = true

    try {
      await api.post("/auth/refresh")
      flushQueue(null)
      return api(original)
    } catch (refreshError) {
      flushQueue(refreshError)
      if (typeof window !== "undefined") {
        try { await api.post("/auth/logout") } catch { /* cookies may already be gone */ }
        window.location.href = "/login?expired=1"
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
