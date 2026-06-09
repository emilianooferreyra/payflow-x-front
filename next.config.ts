import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://payflow-x-production.up.railway.app/api/v1/:path*",
      },
    ]
  },
}

export default nextConfig
