"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  RiBankLine,
  RiAddLine,
  RiPencilLine,
  RiDeleteBin6Line,
  RiArrowRightSLine,
} from "@remixicon/react"
import {
  getBeneficiaries,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  type Beneficiary,
  type CreateBeneficiaryPayload,
} from "@/lib/api/beneficiaries"
import { getErrorMessage } from "@/lib/api/error"

const CURRENCIES = ["USD", "ARS", "USDT", "BRL"] as const
const BENEFICIARY_TYPES = ["CBU", "CVU", "ALIAS", "SWIFT", "ACCOUNT_NUMBER"] as const

const schema = z.object({
  alias: z.string().min(1, "Required"),
  beneficiaryType: z.enum(BENEFICIARY_TYPES),
  accountNumber: z.string().min(1, "Required"),
  bankName: z.string().optional(),
  currency: z.enum(CURRENCIES),
  country: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
})

type FormData = z.input<typeof schema>

const TYPE_LABELS: Record<string, string> = {
  CBU: "CBU",
  CVU: "CVU",
  ALIAS: "Alias",
  SWIFT: "SWIFT",
  ACCOUNT_NUMBER: "Account Number",
}

export default function BeneficiariesPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Beneficiary | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: getBeneficiaries,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", beneficiaryType: "CBU", country: "AR" },
  })

  const createMut = useMutation({
    mutationFn: (data: CreateBeneficiaryPayload) => createBeneficiary(data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["beneficiaries"] })
      toast.success("Beneficiary created")
      closeDialog()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBeneficiaryPayload> }) =>
      updateBeneficiary(id, data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["beneficiaries"] })
      toast.success("Beneficiary updated")
      closeDialog()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBeneficiary(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["beneficiaries"] })
      toast.success("Beneficiary removed")
      setDeleting(null)
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ currency: "USD", beneficiaryType: "CBU", country: "AR" })
    setDialogOpen(true)
  }

  function openEdit(beneficiary: Beneficiary) {
    setEditing(beneficiary)
    form.reset({
      alias: beneficiary.alias,
      beneficiaryType: beneficiary.beneficiaryType,
      accountNumber: beneficiary.accountNumber,
      bankName: beneficiary.bankName ?? "",
      currency: beneficiary.currency as typeof CURRENCIES[number],
      country: beneficiary.country,
      documentType: beneficiary.documentType ?? "",
      documentNumber: beneficiary.documentNumber ?? "",
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
    form.reset()
  }

  function onSubmit(data: FormData) {
    const payload: CreateBeneficiaryPayload = {
      ...data,
      bankName: data.bankName || undefined,
      documentType: data.documentType || undefined,
      documentNumber: data.documentNumber || undefined,
      country: data.country || "AR",
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Beneficiaries</h1>
            <p className="text-muted-foreground text-sm">Manage your withdrawal destinations</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <RiAddLine className="mr-1.5 size-4" />
            New Beneficiary
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : beneficiaries?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <RiBankLine className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium mb-1">No beneficiaries yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add a bank account or wallet to send funds to.</p>
              <Button size="sm" onClick={openCreate}>
                <RiAddLine className="mr-1.5 size-4" />
                Add Beneficiary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {beneficiaries?.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <RiBankLine className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{b.alias}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {b.currency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {TYPE_LABELS[b.beneficiaryType]}: {b.accountNumber}
                      {b.bankName ? ` · ${b.bankName}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(b)}>
                      <RiPencilLine className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleting(b.id)}>
                      <RiDeleteBin6Line className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Beneficiary" : "New Beneficiary"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the beneficiary details." : "Add a new withdrawal destination."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Alias</Label>
              <Input placeholder="My Savings Account" className="h-14 text-base" {...form.register("alias")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.watch("beneficiaryType")}
                  onValueChange={(v) => form.setValue("beneficiaryType", v as typeof BENEFICIARY_TYPES[number])}
                >
                  <SelectTrigger className="h-14 px-4 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent sideOffset={8}>
                    {BENEFICIARY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="py-3 text-base">{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={form.watch("currency")}
                  onValueChange={(v) => form.setValue("currency", v as typeof CURRENCIES[number])}
                >
                  <SelectTrigger className="h-14 px-4 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent sideOffset={8}>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c} className="py-3 text-base">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Account Number</Label>
              <Input placeholder="CBU / CVU / SWIFT / Alias" className="h-14 text-base" {...form.register("accountNumber")} />
            </div>

            <div className="space-y-1.5">
              <Label>Bank Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="Santander, Mercado Pago..." className="h-14 text-base" {...form.register("bankName")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input placeholder="AR" className="h-14 text-base" {...form.register("country")} />
              </div>
              <div className="space-y-1.5">
                <Label>Document Type <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input placeholder="DNI, CUIT..." className="h-14 text-base" {...form.register("documentType")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Document Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="..." className="h-14 text-base" {...form.register("documentNumber")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Beneficiary</DialogTitle>
            <DialogDescription>
              This won't affect past transactions. You can add them again later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => deleting && deleteMut.mutate(deleting)}
            >
              {deleteMut.isPending ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
