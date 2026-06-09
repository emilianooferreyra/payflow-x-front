"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RiTeamLine, RiAddLine, RiMailSendLine } from "@remixicon/react"
import {
  mockTeamMembers,
  type TeamMember,
  type TeamRole,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
} from "@/lib/mock/team"

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "finance", "viewer"]),
})
type InviteInput = z.infer<typeof inviteSchema>

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {member.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">
          Activo {new Date(member.lastActive).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
        </p>
        <RoleBadge role={member.role} />
        {member.role !== "owner" && (
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7 px-2 hidden sm:flex">
            Editar
          </Button>
        )}
      </div>
    </div>
  )
}

export default function EquipoPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [inviteOpen, setInviteOpen] = useState(false)

  const { register: field, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "viewer" },
  })

  const role = watch("role")

  function onInvite(data: InviteInput) {
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: data.email.split("@")[0],
      email: data.email,
      role: data.role,
      joinedAt: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      avatarInitials: data.email.slice(0, 2).toUpperCase(),
    }
    setMembers((prev) => [...prev, newMember])
    toast.success(`Invitación enviada a ${data.email}`)
    reset()
    setInviteOpen(false)
  }

  return (
    <>
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <RiTeamLine className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Equipo</h1>
                <p className="text-sm text-muted-foreground">{members.length} miembros</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5">
              <RiAddLine className="size-4" />
              Invitar miembro
            </Button>
          </div>

          {/* Roles info */}
          <div className="grid gap-3 sm:grid-cols-4">
            {(Object.entries(ROLE_LABELS) as [TeamRole, string][]).map(([role, label]) => (
              <Card key={role} className="p-4">
                <div className="mb-2">
                  <RoleBadge role={role} />
                </div>
                <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
              </Card>
            ))}
          </div>

          {/* Members list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Miembros del equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {members.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Invite modal */}
      <Dialog open={inviteOpen} onOpenChange={(v) => { if (!v) { reset(); setInviteOpen(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar miembro</DialogTitle>
            <DialogDescription>
              El nuevo miembro recibirá un email con instrucciones para unirse.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="nombre@empresa.com" {...field("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => setValue("role", v as InviteInput["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["admin", "finance", "viewer"] as const).map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className="flex flex-col">
                        <span>{ROLE_LABELS[r]}</span>
                        <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { reset(); setInviteOpen(false) }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <RiMailSendLine className="size-4" />
                Enviar invitación
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
