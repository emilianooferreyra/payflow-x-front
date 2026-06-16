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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiTimeLine className="size-4 text-amber-500" />
          Verificación de identidad
        </CardTitle>
        <CardDescription>
          Para operar en PayFlow necesitás verificar tu identidad. Seleccioná el tipo de documento y envialo para revisión.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
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

        <Button
          onClick={() => handleSubmit()}
          disabled={!selected || isPending}
          className="w-full gap-1.5"
        >
          {isPending ? "Enviando..." : "Enviar verificación"}
        </Button>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiTimeLine className="size-4 text-amber-500" />
          Verificación en curso
        </CardTitle>
        <CardDescription>
          Estamos revisando tu documentación. Te notificaremos cuando el proceso esté completo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
            <RiTimeLine className="size-5 text-amber-500" />
          </div>
          <div className="text-sm">
            <p className="font-medium">En revisión</p>
            {documentType && <p className="text-muted-foreground text-xs">Documento: {documentType}</p>}
            {submittedAt && (
              <p className="text-muted-foreground text-xs">
                Enviado: {new Date(submittedAt).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Verificando datos... Esto suele tomar unos segundos.
        </p>
      </CardContent>
    </Card>
  )
}

function ApprovedView({ documentType, submittedAt, reviewedAt }: KycCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiCheckboxCircleLine className="size-4 text-emerald-500" />
          Identidad verificada
        </CardTitle>
        <CardDescription>
          Tu identidad fue verificada correctamente. Ya podés usar todas las funcionalidades de PayFlow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
            <RiCheckboxCircleLine className="size-5 text-emerald-500" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Verificación completada</p>
            {documentType && <p className="text-muted-foreground text-xs">Documento: {documentType}</p>}
            {submittedAt && (
              <p className="text-muted-foreground text-xs">
                Enviado: {new Date(submittedAt).toLocaleDateString("es-AR")}
              </p>
            )}
            {reviewedAt && (
              <p className="text-muted-foreground text-xs">
                Revisado: {new Date(reviewedAt).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RejectedView(props: KycCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RiCloseCircleLine className="size-4 text-destructive" />
            Verificación rechazada
          </CardTitle>
          <CardDescription>
            Tu verificación no pudo ser completada. Por favor enviá la documentación nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <RiCloseCircleLine className="size-5 text-destructive" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Documentación rechazada</p>
              <p className="text-muted-foreground text-xs">Corregí los datos e intentá de nuevo</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <PendingView {...props} />
    </div>
  )
}

function KycSkeleton() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted animate-pulse" />
          <div>
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mt-1 animate-pulse" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
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
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <RiShieldLine className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Verificación de identidad</h1>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {status === "APPROVED"
                ? "Tu identidad está verificada"
                : "Completá tu verificación para operar en PayFlow"}
            </p>
          </div>
        </div>

        {status === "PENDING" && <PendingView {...pageProps} />}
        {status === "IN_REVIEW" && <InReviewView {...pageProps} />}
        {status === "APPROVED" && <ApprovedView {...pageProps} />}
        {status === "REJECTED" && <RejectedView {...pageProps} />}
      </div>
    </main>
  )
}
