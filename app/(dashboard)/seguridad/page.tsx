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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4 lg:p-6 w-full">

        {/* Métodos de inicio de sesión */}
        <div>
          <h2 className="text-base font-semibold mb-1">Métodos de inicio de sesión</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Personaliza la forma en que accedes a tu cuenta. Vincula tu perfil de Google y configura contraseñas para una autenticación segura y sin complicaciones.
          </p>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {/* Google */}
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <RiGoogleLine className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Google</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                {isGoogleUser ? (
                  <Badge className="bg-primary/10 text-primary border-0 shrink-0">Activado</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast.info("Próximamente")}>
                    Vincular
                  </Button>
                )}
              </div>

              {/* Email y contraseña */}
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <RiMailLine className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email y contraseña</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 shrink-0">Activado</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceso con contraseña */}
        <div>
          <h2 className="text-base font-semibold mb-1">Acceso con contraseña</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Utiliza una contraseña para iniciar sesión además de tus métodos de acceso vinculados.
          </p>
          <Card>
            <CardContent className="px-4 py-4">
              <Button variant="outline" onClick={() => setChangePassOpen(true)} className="gap-2">
                <RiLockPasswordLine className="size-4" />
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sesiones iniciadas */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold">Sesiones iniciadas</h2>
            {sessions.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive text-xs h-7"
                onClick={() => revokeAll()}
                disabled={revokingAll}
              >
                Cerrar todas
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Tienes la sesión iniciada en estos dispositivos o has iniciado sesión en ellos en los últimos 28 días.
          </p>
          <Card>
            {sessionsLoading ? (
              <CardContent className="px-4 py-6 text-sm text-muted-foreground">Cargando sesiones…</CardContent>
            ) : sessions.length === 0 ? (
              <CardContent className="px-4 py-6 text-sm text-muted-foreground">No hay sesiones activas.</CardContent>
            ) : (
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-4 py-2 border-b">
                  <span className="text-xs font-medium text-muted-foreground">Sesión</span>
                  <span className="text-xs font-medium text-muted-foreground">Última actividad</span>
                  <span className="text-xs font-medium text-muted-foreground">Origen</span>
                  <span />
                </div>
                <div className="divide-y divide-border">
                  {sessions.map((session) => {
                    const { browser, os } = parseBrowser(session.userAgent)
                    const isCurrent = session.id === currentSession?.id
                    const lastActive = session.lastUsedAt ?? session.createdAt
                    return (
                      <div key={session.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <RiComputerLine className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{browser}</p>
                              {isCurrent && (
                                <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 shrink-0">
                                  Sesión actual
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{os}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {relativeTime(lastActive)}
                        </span>
                        <span className="text-sm text-muted-foreground capitalize">
                          {session.userAgent?.toLowerCase().includes("google") ? "google" : "local"}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => revoke(session.id)}
                          disabled={revoking || isCurrent}
                          title={isCurrent ? "Sesión actual" : "Cerrar sesión"}
                        >
                          <RiLogoutBoxRLine className="size-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
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
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                <RiShieldCheckLine className="size-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium">Email enviado</p>
              <p className="text-xs text-muted-foreground">Revisá tu bandeja de entrada en <strong>{user?.email}</strong></p>
              <Button variant="outline" className="mt-2 w-full" onClick={() => { setChangePassOpen(false); setEmailSent(false) }}>
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} readOnly className="bg-muted" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setChangePassOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={() => sendResetEmail()} disabled={sendingEmail || !user?.email}>
                  {sendingEmail ? "Enviando…" : "Enviar email"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
