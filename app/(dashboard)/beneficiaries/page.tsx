"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
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
  alias: z.string().min(1, "Requerido"),
  beneficiaryType: z.enum(BENEFICIARY_TYPES),
  accountNumber: z.string().min(1, "Requerido"),
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
  ACCOUNT_NUMBER: "Número de cuenta",
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
      toast.success("Beneficiario creado")
      closeDialog()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBeneficiaryPayload> }) =>
      updateBeneficiary(id, data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["beneficiaries"] })
      toast.success("Beneficiario actualizado")
      closeDialog()
    },
    onError(err) { toast.error(getErrorMessage(err)) },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBeneficiary(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["beneficiaries"] })
      toast.success("Beneficiario eliminado")
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
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              DESTINOS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
                Beneficiarios
              </h1>
              <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
                Gestioná las cuentas bancarias y billeteras donde enviás fondos.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all"
            >
              <RiAddLine className="size-4 -ml-1 mr-1.5 inline" />
              Nuevo beneficiario
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </div>
            ))}
          </div>
        ) : beneficiaries?.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-10 text-center">
            <RiBankLine className="size-10 text-[#666666]/40 mb-3 mx-auto" />
            <p className="text-sm font-medium mb-1">Sin beneficiarios aún</p>
            <p className="text-xs text-[#666666] mb-4">Agregá una cuenta bancaria o billetera para enviar fondos.</p>
            <button
              onClick={openCreate}
              className="h-9 gap-2 rounded-xl border-2 border-[#111111] bg-white px-4 text-sm font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all"
            >
              <RiAddLine className="mr-1.5 size-4 inline" />
              Agregar beneficiario
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {beneficiaries?.map((b) => (
              <div key={b.id} className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#F5F5F5] shrink-0">
                    <RiBankLine className="size-5 text-[#111111]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{b.alias}</p>
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-[#666666]">
                        {b.currency}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {TYPE_LABELS[b.beneficiaryType]}: {b.accountNumber}
                      {b.bankName ? ` · ${b.bankName}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all"
                    >
                      <RiPencilLine className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(b.id)}
                      className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all text-[#E5484D]"
                    >
                      <RiDeleteBin6Line className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar beneficiario" : "Nuevo beneficiario"}</DialogTitle>
            <DialogDescription>
              {editing ? "Actualizá los datos del beneficiario." : "Agregá un nuevo destino de retiro."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Alias</Label>
              <Input placeholder="Mi cuenta de ahorros" className="h-14 text-base" {...form.register("alias")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
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
                <Label>Moneda</Label>
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
              <Label>Número de cuenta</Label>
              <Input placeholder="CBU / CVU / Alias / SWIFT" className="h-14 text-base" {...form.register("accountNumber")} />
            </div>

            <div className="space-y-1.5">
              <Label>Nombre del banco <span className="text-[#666666] text-xs">(opcional)</span></Label>
              <Input placeholder="Santander, Mercado Pago..." className="h-14 text-base" {...form.register("bankName")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>País</Label>
                <Input placeholder="AR" className="h-14 text-base" {...form.register("country")} />
              </div>
              <div className="space-y-1.5">
              <Label>Tipo de documento <span className="text-[#666666] text-xs">(opcional)</span></Label>
              <Input placeholder="DNI, CUIT..." className="h-14 text-base" {...form.register("documentType")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Número de documento <span className="text-[#666666] text-xs">(opcional)</span></Label>
              <Input placeholder="..." className="h-14 text-base" {...form.register("documentNumber")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeDialog} className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all">
                {editing ? "Guardar cambios" : "Crear"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar beneficiario</DialogTitle>
            <DialogDescription>
              Esto no afecta transacciones anteriores. Podés agregarlo de nuevo después.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleting(null)} className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all">
              Cancelar
            </button>
            <button
              disabled={deleteMut.isPending}
              onClick={() => deleting && deleteMut.mutate(deleting)}
              className="h-12 gap-2 rounded-xl border-2 border-[#E5484D] bg-white px-6 text-base font-semibold text-[#E5484D] shadow-sm hover:bg-red-50 transition-all"
            >
              {deleteMut.isPending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
