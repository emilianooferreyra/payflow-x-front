"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  RiShieldLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMe } from "@/lib/api/auth"
import { submitKyc } from "@/lib/api/kyc"
import { getErrorMessage } from "@/lib/api/error"
import type { KycStatus } from "@/lib/api/auth"

const STATUS_BADGE: Record<KycStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Pendiente de envío", variant: "outline" },
  IN_REVIEW: { label: "En revisión", variant: "secondary" },
  APPROVED: { label: "Verificada", variant: "default" },
  REJECTED: { label: "Rechazada", variant: "destructive" },
}

const DOCUMENT_OPTIONS = [
  { value: "DNI", label: "DNI / Documento Nacional de Identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "DRIVER_LICENSE", label: "Licencia de Conducir" },
]

interface KycCardProps {
  status: KycStatus
  documentType?: string
  submittedAt?: string
  reviewedAt?: string
}

function PendingView({ documentType, submittedAt }: KycCardProps) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(documentType ?? "")

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: () => submitKyc(selected),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["me"] })
      toast.success("Documentación enviada para revisión")
    },
    onError(err) {
      toast.error(getErrorMessage(err))
    },
  })

  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <RiTimeLine className="size-5 text-[#F59E0B]" />
        <h3 className="text-base font-semibold text-[#111111]">Verificación de identidad</h3>
      </div>
      <p className="text-sm text-[#666666] mb-5">
        Para operar en PayFlow necesitás verificar tu identidad. Seleccioná el tipo de documento y envialo para revisión.
      </p>
      <div className="space-y-4">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-14 border-[#E5E5E5] rounded-xl px-4 text-base">
            <SelectValue placeholder="Seleccioná un tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => handleSubmit()}
          disabled={!selected || isPending}
          className="h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {isPending ? "Enviando..." : "Enviar verificación"}
        </button>
      </div>
    </div>
  )
}

function InReviewView({ documentType, submittedAt }: KycCardProps) {
  const qc = useQueryClient()
  const notifiedRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    pollRef.current = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["me"] })
    }, 5_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [qc])

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 0,
    retry: false,
  })

  useEffect(() => {
    if (user?.kyc?.status === "APPROVED" && !notifiedRef.current) {
      notifiedRef.current = true
      toast.success("Identidad verificada correctamente — ya podés operar", { duration: 6000 })
    }
  }, [user?.kyc?.status])

  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <RiTimeLine className="size-5 text-[#F59E0B]" />
        <h3 className="text-base font-semibold text-[#111111]">Verificación en curso</h3>
      </div>
      <p className="text-sm text-[#666666] mb-5">
        Estamos revisando tu documentación. Te notificaremos cuando el proceso esté completo.
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#F59E0B]/10">
            <RiTimeLine className="size-5 text-[#F59E0B]" />
          </div>
          <div className="text-sm">
            <p className="font-medium">En revisión</p>
            {documentType && <p className="text-[#666666] text-xs">Documento: {documentType}</p>}
            {submittedAt && (
              <p className="text-[#666666] text-xs">
                Enviado: {new Date(submittedAt).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-[#666666] text-center animate-pulse">
          Verificando datos... Esto suele tomar unos segundos.
        </p>
      </div>
    </div>
  )
}

function ApprovedView({ documentType, submittedAt, reviewedAt }: KycCardProps) {
  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <RiCheckboxCircleLine className="size-5 text-[#059669]" />
        <h3 className="text-base font-semibold text-[#111111]">Identidad verificada</h3>
      </div>
      <p className="text-sm text-[#666666] mb-5">
        Tu identidad fue verificada correctamente. Ya podés usar todas las funcionalidades de PayFlow.
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#059669]/10">
            <RiCheckboxCircleLine className="size-5 text-[#059669]" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Verificación completada</p>
            {documentType && <p className="text-[#666666] text-xs">Documento: {documentType}</p>}
            {submittedAt && (
              <p className="text-[#666666] text-xs">
                Enviado: {new Date(submittedAt).toLocaleDateString("es-AR")}
              </p>
            )}
            {reviewedAt && (
              <p className="text-[#666666] text-xs">
                Revisado: {new Date(reviewedAt).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RejectedView(props: KycCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <RiCloseCircleLine className="size-5 text-[#E5484D]" />
          <h3 className="text-base font-semibold text-[#111111]">Verificación rechazada</h3>
        </div>
        <p className="text-sm text-[#666666] mb-5">
          Tu verificación no pudo ser completada. Por favor enviá la documentación nuevamente.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-[#E5484D]/10 p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#E5484D]/10">
              <RiCloseCircleLine className="size-5 text-[#E5484D]" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Documentación rechazada</p>
              <p className="text-[#666666] text-xs">Corregí los datos e intentá de nuevo</p>
            </div>
          </div>
        </div>
      </div>
      <PendingView {...props} />
    </div>
  )
}

function KycSkeleton() {
  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#F5F5F5] animate-pulse" />
            <span className="h-3 w-24 bg-[#F5F5F5] rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-64 bg-[#F5F5F5] rounded animate-pulse" />
            <div className="h-6 w-28 bg-[#F5F5F5] rounded animate-pulse" />
          </div>
          <div className="mt-3 h-5 w-80 bg-[#F5F5F5] rounded animate-pulse" />
        </div>
        <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
          <div className="h-40 bg-[#F5F5F5] rounded animate-pulse" />
        </div>
      </div>
    </main>
  )
}

export default function KycPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (isLoading) return <KycSkeleton />

  const kyc = user?.kyc
  const status = kyc?.status ?? "PENDING"
  const badge = STATUS_BADGE[status]

  const pageProps: KycCardProps = {
    status,
    documentType: kyc?.documentType ?? undefined,
    submittedAt: kyc?.submittedAt ?? undefined,
    reviewedAt: kyc?.reviewedAt ?? undefined,
  }

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              VERIFICACIÓN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
              Verificación de identidad
            </h1>
            <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-xs font-medium text-[#666666]">
              {badge.label}
            </span>
          </div>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            {status === "APPROVED"
              ? "Tu identidad está verificada"
              : "Completá tu verificación para operar en PayFlow"}
          </p>
        </div>

        {status === "PENDING" && <PendingView {...pageProps} />}
        {status === "IN_REVIEW" && <InReviewView {...pageProps} />}
        {status === "APPROVED" && <ApprovedView {...pageProps} />}
        {status === "REJECTED" && <RejectedView {...pageProps} />}
      </div>
    </main>
  )
}
