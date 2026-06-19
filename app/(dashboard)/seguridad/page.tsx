"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  RiGoogleLine,
  RiMailLine,
  RiComputerLine,
  RiLogoutBoxRLine,
  RiLockPasswordLine,
  RiShieldCheckLine,
} from "@remixicon/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMe, getSessions, revokeSession, revokeAllSessions, forgotPassword } from "@/lib/api/auth"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `hace ${s} seg`
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} día${d !== 1 ? "s" : ""}`
}

function parseBrowser(ua?: string): { browser: string; os: string } {
  if (!ua) return { browser: "Navegador desconocido", os: "SO desconocido" }
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" : "Navegador"
  const os =
    /Windows NT 10/.test(ua) ? "Windows 10" :
    /Windows NT 11/.test(ua) ? "Windows 11" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /iPhone/.test(ua) ? "iPhone" :
    /Android/.test(ua) ? "Android" :
    /Linux/.test(ua) ? "Linux" : "SO desconocido"
  return { browser, os }
}

export default function SeguridadPage() {
  const qc = useQueryClient()
  const [changePassOpen, setChangePassOpen] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe, staleTime: 5 * 60 * 1000, retry: false })
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    staleTime: 2 * 60_000,
    retry: false,
  })

  const { mutate: revoke, isPending: revoking } = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Sesión cerrada")
    },
    onError: () => toast.error("No se pudo cerrar la sesión"),
  })

  const { mutate: revokeAll, isPending: revokingAll } = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Todas las sesiones cerradas")
    },
    onError: () => toast.error("No se pudo cerrar las sesiones"),
  })

  const { mutate: sendResetEmail, isPending: sendingEmail } = useMutation({
    mutationFn: () => forgotPassword(user?.email ?? ""),
    onSuccess: () => setEmailSent(true),
    onError: () => toast.error("No se pudo enviar el email"),
  })

  const isGoogleUser = user?.authProvider === "GOOGLE"
  const currentSession = sessions.length > 0
    ? sessions.reduce((a, b) => (a.lastUsedAt ?? a.createdAt) > (b.lastUsedAt ?? b.createdAt) ? a : b)
    : null

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              SEGURIDAD
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Seguridad
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Protegé tu cuenta administrando métodos de inicio de sesión, contraseñas y sesiones activas.
          </p>
        </div>

        {/* Métodos de inicio de sesión */}
        <div className="mb-14">
          <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">Métodos de inicio de sesión</h3>
          <p className="text-sm text-[#666666] mb-3">
            Personaliza la forma en que accedes a tu cuenta. Vincula tu perfil de Google y configura contraseñas para una autenticación segura y sin complicaciones.
          </p>
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5]">
            {/* Google */}
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                <RiGoogleLine className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-[#666666] truncate">{user?.email}</p>
              </div>
              {isGoogleUser ? (
                <span className="inline-flex items-center rounded-full bg-[#059669]/10 px-2 py-0.5 text-xs font-medium text-[#059669] shrink-0">Activado</span>
              ) : (
                <button
                  className="h-9 gap-2 rounded-xl border-2 border-[#E5484D] bg-white px-4 text-sm font-semibold text-[#E5484D] shadow-sm hover:bg-red-50 transition-all shrink-0"
                  onClick={() => toast.info("Próximamente")}
                >
                  Vincular
                </button>
              )}
            </div>

            {/* Email y contraseña */}
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                <RiMailLine className="size-5 text-[#666666]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Email y contraseña</p>
                <p className="text-xs text-[#666666] truncate">{user?.email}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#059669]/10 px-2 py-0.5 text-xs font-medium text-[#059669] shrink-0">Activado</span>
            </div>
          </div>
        </div>

        {/* Acceso con contraseña */}
        <div className="mb-14">
          <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">Acceso con contraseña</h3>
          <p className="text-sm text-[#666666] mb-3">
            Utiliza una contraseña para iniciar sesión además de tus métodos de acceso vinculados.
          </p>
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
            <button
              className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
              onClick={() => setChangePassOpen(true)}
            >
              <RiLockPasswordLine className="size-4" />
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Sesiones iniciadas */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase">Sesiones iniciadas</h3>
            {sessions.length > 1 && (
              <button
                className="h-9 gap-2 rounded-xl border-2 border-transparent hover:border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#E5484D] hover:bg-[#F5F5F5] transition-all"
                onClick={() => revokeAll()}
                disabled={revokingAll}
              >
                Cerrar todas
              </button>
            )}
          </div>
          <p className="text-sm text-[#666666] mb-3">
            Tienes la sesión iniciada en estos dispositivos o has iniciado sesión en ellos en los últimos 28 días.
          </p>
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white">
            {sessionsLoading ? (
              <div className="px-4 py-6 text-sm text-[#666666]">Cargando sesiones…</div>
            ) : sessions.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#666666]">No hay sesiones activas.</div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-4 py-2 border-b border-[#E5E5E5]">
                  <span className="text-xs font-medium text-[#666666]">Sesión</span>
                  <span className="text-xs font-medium text-[#666666]">Última actividad</span>
                  <span className="text-xs font-medium text-[#666666]">Origen</span>
                  <span />
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {sessions.map((session) => {
                    const { browser, os } = parseBrowser(session.userAgent)
                    const isCurrent = session.id === currentSession?.id
                    const lastActive = session.lastUsedAt ?? session.createdAt
                    return (
                      <div key={session.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5]">
                            <RiComputerLine className="size-4 text-[#666666]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{browser}</p>
                              {isCurrent && (
                                <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium text-[#666666] shrink-0">
                                  Sesión actual
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#666666]">{os}</p>
                          </div>
                        </div>
                        <span className="text-sm text-[#666666] whitespace-nowrap">
                          {relativeTime(lastActive)}
                        </span>
                        <span className="text-sm text-[#666666] capitalize">
                          {session.userAgent?.toLowerCase().includes("google") ? "google" : "local"}
                        </span>
                        <button
                          className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all shrink-0"
                          onClick={() => revoke(session.id)}
                          disabled={revoking || isCurrent}
                          title={isCurrent ? "Sesión actual" : "Cerrar sesión"}
                        >
                          <RiLogoutBoxRLine className="size-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Dialog: cambiar contraseña */}
      <Dialog open={changePassOpen} onOpenChange={(v) => { setChangePassOpen(v); setEmailSent(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Te enviaremos un email con un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          {emailSent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#059669]/10">
                <RiShieldCheckLine className="size-6 text-[#059669]" />
              </div>
              <p className="text-sm font-medium">Email enviado</p>
              <p className="text-xs text-[#666666]">Revisá tu bandeja de entrada en <strong>{user?.email}</strong></p>
              <button
                className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all mt-2 w-full"
                onClick={() => { setChangePassOpen(false); setEmailSent(false) }}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} readOnly className="bg-[#F5F5F5]" />
              </div>
              <div className="flex gap-3">
                <button
                  className="h-12 gap-2 rounded-xl border-2 border-[#E5E5E5] bg-white px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all flex-1"
                  onClick={() => setChangePassOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="h-12 gap-2 rounded-xl bg-white border-2 border-[#111111] px-6 text-base font-semibold text-[#111111] shadow-sm hover:bg-[#F5F5F5] active:bg-[#E5E5E5] transition-all flex-1"
                  onClick={() => sendResetEmail()}
                  disabled={sendingEmail || !user?.email}
                >
                  {sendingEmail ? "Enviando…" : "Enviar email"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
