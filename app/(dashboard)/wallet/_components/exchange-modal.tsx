"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exchange } from "@/lib/api/wallet"
import { getExchangeRates } from "@/lib/api/exchange-rates"
import { getErrorMessage } from "@/lib/api/error"
import { formatCurrency } from "@/lib/utils"

const CURRENCIES = ["USD", "ARS", "USDT"] as const

const schema = z.object({
  fromCurrency: z.enum(["USD", "ARS", "USDT"]),
  toCurrency: z.enum(["USD", "ARS", "USDT"]),
  amount: z.coerce.number().positive(),
})

type Input = z.output<typeof schema>

export function ExchangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { register: field, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.input<typeof schema>, unknown, Input>({
    resolver: zodResolver(schema),
    defaultValues: { fromCurrency: "USD", toCurrency: "ARS" },
  })

  const fromCurrency = watch("fromCurrency")
  const toCurrency = watch("toCurrency")
  const amount = Number(watch("amount"))

  const { data: rates } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: getExchangeRates,
    staleTime: 30_000,
  })

  const rate = rates?.find((r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency)
  const preview = rate && amount > 0 ? (Number(amount) * Number(rate.rate)).toFixed(2) : null

  const { mutate, isPending } = useMutation({
    mutationFn: exchange,
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["wallets"] })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Intercambio exitoso")
      reset()
      onClose()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Intercambiar moneda</DialogTitle>
          <DialogDescription>Convertí entre tus billeteras al tipo de cambio actual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>De</Label>
              <Select value={fromCurrency} onValueChange={(v) => setValue("fromCurrency", v as typeof CURRENCIES[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>A</Label>
              <Select value={toCurrency} onValueChange={(v) => setValue("toCurrency", v as typeof CURRENCIES[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Monto ({fromCurrency})</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...field("amount")} />
            {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
          </div>
          {rate && (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Tipo de cambio</span>
                <span>1 {fromCurrency} = {Number(rate.rate).toFixed(4)} {toCurrency}</span>
              </div>
              {preview && (
                <div className="flex justify-between font-medium">
                  <span>Recibís</span>
                  <span>{formatCurrency(preview, toCurrency)}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose() }}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Procesando…" : "Intercambiar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
