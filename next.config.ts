import type { NextConfig } from "next"

// Backend local por defecto (docker compose expone :3000). Para producción,
// setear BACKEND_URL en el entorno del deploy.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000"

const nextConfig: NextConfig = {
  cacheComponents: true,

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
