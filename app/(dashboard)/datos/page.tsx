"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  RiDownload2Line,
  RiMailCheckLine,
  RiDeleteBinLine,
  RiAlertLine,
} from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMe } from "@/lib/api/auth"

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

function DataRow({ icon: Icon, label, description, action }: {
  icon: React.ElementType
  label: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {action}
    </div>
  )
}

export default function DatosPage() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe, staleTime: 5 * 60 * 1000, retry: false })

  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4 lg:p-6 w-full">

        {/* Tus datos */}
        <SectionCard
          title="Tus datos"
          description="Accedé y descargá la información que tenemos sobre tu cuenta."
        >
          <DataRow
            icon={RiDownload2Line}
            label="Exportar datos"
            description="Descargá un archivo con toda tu información de cuenta y transacciones."
            action={
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast.info("Próximamente")}>
                Exportar
              </Button>
            }
          />
          <DataRow
            icon={RiMailCheckLine}
            label="Confirmación de email"
            description={user?.email ? `${user.email} ${user?.emailConfirm ? "· Verificado" : "· Sin verificar"}` : "—"}
            action={
              !user?.emailConfirm ? (
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast.info("Próximamente")}>
                  Verificar
                </Button>
              ) : null
            }
          />
        </SectionCard>

        {/* Privacidad */}
        <SectionCard
          title="Privacidad"
          description="Controlá cómo se usa tu información dentro de PayFlow."
        >
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Comunicaciones de marketing</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recibir emails sobre novedades y ofertas especiales.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Próximamente")}>
              Gestionar
            </Button>
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Política de privacidad</p>
              <p className="text-xs text-muted-foreground mt-0.5">Leé cómo recopilamos y usamos tu información.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.info("Próximamente")}>
              Ver →
            </Button>
          </div>
        </SectionCard>

        {/* Zona de peligro */}
        <SectionCard
          title="Zona de peligro"
          description="Acciones irreversibles sobre tu cuenta. Procedé con cuidado."
        >
          <DataRow
            icon={RiDeleteBinLine}
            label="Eliminar cuenta"
            description="Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer."
            action={
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                Eliminar
              </Button>
            }
          />
        </SectionCard>

      </div>

      {/* Dialog: eliminar cuenta */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <RiAlertLine className="size-5 text-destructive" />
            </div>
            <DialogTitle>Eliminar cuenta</DialogTitle>
            <DialogDescription>
              Esta acción es permanente e irreversible. Se eliminarán todos tus datos, incluyendo transacciones, billeteras e inversiones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Escribí <strong>eliminar</strong> para confirmar
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="eliminar"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setDeleteOpen(false); setConfirmText("") }}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={confirmText !== "eliminar"}
                onClick={() => toast.info("Próximamente")}
              >
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
