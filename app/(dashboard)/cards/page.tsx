"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RiLockLine, RiLockUnlockLine } from "@remixicon/react"
import { getCards, freezeCard, unfreezeCard, type Card as CardType } from "@/lib/api/cards"
import { getErrorMessage } from "@/lib/api/error"
import { formatCurrency } from "@/lib/utils"

function VirtualCard({ card }: { card: CardType }) {
  const qc = useQueryClient()

  const { mutate: freeze, isPending: freezing } = useMutation({
    mutationFn: () => freezeCard(card.id),
    onSuccess() { qc.invalidateQueries({ queryKey: ["cards"] }); toast.success("Card frozen") },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const { mutate: unfreeze, isPending: unfreezing } = useMutation({
    mutationFn: () => unfreezeCard(card.id),
    onSuccess() { qc.invalidateQueries({ queryKey: ["cards"] }); toast.success("Card unfrozen") },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const isPending = freezing || unfreezing

  return (
    <Card className="overflow-hidden">
      <div className={`relative h-52 p-6 transition-colors duration-300 ${card.isFrozen ? "bg-gradient-to-br from-slate-600 to-slate-800" : "bg-gradient-to-br from-emerald-600 to-emerald-950"}`}>
        {card.isFrozen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="text-center text-white">
              <RiLockLine className="mx-auto size-10 mb-2" />
              <p className="text-sm font-medium">Card frozen</p>
            </div>
          </div>
        )}
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-white/80 text-sm font-semibold tracking-wide">PayFlow</p>
            <div className="flex items-center gap-2">
              {card.network && <span className="text-white/80 text-sm">{card.network}</span>}
              <Badge variant={card.isFrozen ? "secondary" : "outline"} className={card.isFrozen ? "" : "border-white/30 text-white"}>
                {card.isFrozen ? "Frozen" : card.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="font-mono text-xl tracking-[0.25em] text-white">{card.maskedNumber}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wide">Expires</p>
                <p className="text-white text-sm font-medium">
                  {new Date(card.expiresAt).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" })}
                </p>
              </div>
              <Badge variant="outline" className="border-white/30 text-white text-xs">{card.type}</Badge>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {card.spendingLimit && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spending limit</span>
            <span className="font-medium">{formatCurrency(card.spendingLimit)}</span>
          </div>
        )}
        {card.issuer && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Issuer</span>
            <span className="font-medium">{card.issuer}</span>
          </div>
        )}
        <Button
          variant={card.isFrozen ? "default" : "outline"}
          className="w-full"
          disabled={isPending || !card.isActive}
          onClick={() => card.isFrozen ? unfreeze() : freeze()}
        >
          {card.isFrozen ? (
            <><RiLockUnlockLine className="mr-2 size-4" />{unfreezing ? "Unfreezing…" : "Unfreeze card"}</>
          ) : (
            <><RiLockLine className="mr-2 size-4" />{freezing ? "Freezing…" : "Freeze card"}</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function CardsPage() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
    staleTime: 5 * 60_000,
  })

  return (
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <div>
            <h1 className="text-2xl font-semibold">Cards</h1>
            <p className="text-muted-foreground text-sm">Your virtual and physical cards</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-52 w-full rounded-none" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cards?.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No cards yet</CardTitle>
                <CardDescription>You don&apos;t have any cards associated with your account.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards?.map((card) => <VirtualCard key={card.id} card={card} />)}
            </div>
          )}
        </div>
      </main>
  )
}
