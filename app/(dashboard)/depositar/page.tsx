"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiFileCopyLine, RiCheckLine, RiArrowDownCircleLine, RiTimeLine } from "@remixicon/react"
import { bankingInstructions } from "@/lib/mock/banking"
import { getTransactions } from "@/lib/api/transactions"
import { formatCurrency } from "@/lib/utils"

function CopyField({ label, value, copyable }: { label: string; value: string; copyable: boolean }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? <RiCheckLine className="size-4 text-primary" /> : <RiFileCopyLine className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      )}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-primary/10 text-primary",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  FAILED: "bg-destructive/10 text-destructive",
}

export default function DepositarPage() {
  const { data: txData, isLoading } = useQuery({
    queryKey: ["transactions", 1, "", "DEPOSIT"],
    queryFn: () => getTransactions({ page: 1, limit: 10, type: "DEPOSIT" }),
  })

  return (
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <RiArrowDownCircleLine className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Depositar</h1>
              <p className="text-sm text-muted-foreground">Recibí fondos en tu cuenta PayFlow</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* Instructions */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos bancarios para transferencia</CardTitle>
                  <CardDescription>
                    Usá estos datos para recibir pagos de clientes o transferir desde otras cuentas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs defaultValue="usd">
                    <TabsList className="mb-4">
                      {bankingInstructions.map((inst, i) => (
                        <TabsTrigger key={i} value={i === 0 ? "usd" : "swift"}>
                          {inst.flag} {inst.currency}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {bankingInstructions.map((inst, i) => (
                      <TabsContent key={i} value={i === 0 ? "usd" : "swift"}>
                        <div className="divide-y">
                          {inst.fields.map((field) => (
                            <CopyField key={field.label} {...field} />
                          ))}
                        </div>
                        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-muted/60 p-3">
                          <RiTimeLine className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{inst.note}</p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Deposit history */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Historial de depósitos</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : txData?.data.length === 0 ? (
                    <div className="py-10 text-center">
                      <RiArrowDownCircleLine className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No hay depósitos aún.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usá los datos de arriba para recibir tu primer depósito.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {txData?.data.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium">{tx.description || "Deposit"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(tx.createdAt).toLocaleDateString("es-AR", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">+{formatCurrency(tx.amount)}</p>
                            <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS["COMPLETED"]}`}>
                              Acreditado
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  )
}
