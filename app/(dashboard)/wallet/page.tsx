"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RiArrowDownLine, RiArrowUpLine, RiExchangeLine } from "@remixicon/react"
import { getWallets } from "@/lib/api/wallet"
import { formatCurrency } from "@/lib/utils"
import { DepositModal } from "./_components/deposit-modal"
import { WithdrawModal } from "./_components/withdraw-modal"
import { ExchangeModal } from "./_components/exchange-modal"

type ModalType = "deposit" | "withdraw" | "exchange" | null

export default function WalletPage() {
  const [modal, setModal] = useState<ModalType>(null)

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  })

  return (
    <>
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Wallet</h1>
              <p className="text-muted-foreground text-sm">Manage your multi-currency balances</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setModal("deposit")}>
                <RiArrowDownLine className="mr-1.5 size-4" />
                Deposit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setModal("withdraw")}>
                <RiArrowUpLine className="mr-1.5 size-4" />
                Withdraw
              </Button>
              <Button size="sm" onClick={() => setModal("exchange")}>
                <RiExchangeLine className="mr-1.5 size-4" />
                Exchange
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2"><Skeleton className="h-4 w-16" /></CardHeader>
                    <CardContent><Skeleton className="h-8 w-32" /></CardContent>
                  </Card>
                ))
              : wallets?.map((wallet) => (
                  <Card key={wallet.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-xs uppercase tracking-wide">{wallet.currency}</CardDescription>
                        <Badge variant="secondary" className="text-xs">{wallet.currency}</Badge>
                      </div>
                      <CardTitle className="text-3xl font-semibold tabular-nums">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setModal("deposit")}>Deposit</Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setModal("withdraw")}>Withdraw</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </main>

      <DepositModal open={modal === "deposit"} onClose={() => setModal(null)} />
      <WithdrawModal open={modal === "withdraw"} onClose={() => setModal(null)} />
      <ExchangeModal open={modal === "exchange"} onClose={() => setModal(null)} />
    </>
  )
}
