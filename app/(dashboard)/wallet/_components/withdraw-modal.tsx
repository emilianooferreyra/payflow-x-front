"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { withdraw } from "@/lib/api/wallet"
import { getErrorMessage } from "@/lib/api/error"

const CURRENCIES = ["USD", "ARS", "USDT"] as const

const schema = z.object({
  currency: z.enum(["USD", "ARS", "USDT"]),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
})

type Input = z.output<typeof schema>

export function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { register: field, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.input<typeof schema>, unknown, Input>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD" },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: withdraw,
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["wallets"] })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Retiro exitoso")
      reset()
      onClose()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retirar fondos</DialogTitle>
          <DialogDescription>Retirá fondos de tu billetera.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as typeof CURRENCIES[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Monto</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...field("amount")} />
            {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Descripción <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input placeholder="Retirar al banco..." {...field("description")} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); onClose() }}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Procesando…" : "Retirar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
