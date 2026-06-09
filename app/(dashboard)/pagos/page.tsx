"use client"

import { toast } from "sonner"
import {
  RiCheckLine,
  RiBankCardLine,
  RiAddLine,
  RiShieldLine,
} from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PLAN_FEATURES = [
  "Billetera en USD Digital",
  "Rendimientos automáticos al 3.65% APY",
  "Transacciones ilimitadas",
  "Acceso a inversiones",
  "Soporte por email",
]

export default function PagosPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4 lg:p-6 w-full">

        {/* Plan actual */}
        <div>
          <h2 className="text-base font-semibold mb-1">Plan actual</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tu plan incluye acceso a todas las funciones principales de PayFlow.
          </p>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-semibold">PayFlow Free</p>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                      Activo
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Sin costo mensual</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Próximamente")}>
                  Actualizar plan
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {PLAN_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <RiCheckLine className="size-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métodos de pago */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold">Métodos de pago</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => toast.info("Próximamente")}
            >
              <RiAddLine className="size-3.5" />
              Agregar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Métodos de pago para suscripciones y servicios premium.
          </p>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <RiBankCardLine className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Sin métodos de pago</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Agregá una tarjeta para acceder a planes premium.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Próximamente")}>
                <RiAddLine className="size-4" />
                Agregar tarjeta
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Historial de facturación */}
        <div>
          <h2 className="text-base font-semibold mb-1">Historial de facturación</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Facturas y recibos de tus pagos anteriores.
          </p>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <RiShieldLine className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Sin historial de pagos</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tus facturas aparecerán aquí una vez que tengas un plan de pago.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  )
}
