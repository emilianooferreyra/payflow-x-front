import { connection } from "next/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/api/get-query-client"
import { getWallets } from "@/lib/api/wallet"
import { getMe } from "@/lib/api/auth"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  await connection()
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["wallets"], queryFn: getWallets }),
    queryClient.prefetchQuery({ queryKey: ["me"], queryFn: getMe }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
