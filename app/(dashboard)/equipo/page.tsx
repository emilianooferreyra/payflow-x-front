"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-[#F5F5F5] text-[#666666] text-xs font-semibold">
            {member.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-[#111111]">{member.name}</p>
          <p className="text-xs text-[#666666]">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xs text-[#666666] hidden sm:block">
          Active {new Date(member.lastActive).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
        </p>
        <RoleBadge role={member.role} />
        {member.role !== "owner" && (
          <button className="hidden sm:inline-flex text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors h-7 px-2">
            Edit
          </button>
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
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">

        {/* ─── Page Header ─── */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide">
              {members.length} members
            </span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
                Team
              </h1>
              <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
                Manage your team members and their roles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7C3AED] px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all shrink-0"
            >
              <RiAddLine className="size-4" />
              Invite member
            </button>
          </div>
        </div>

        {/* ─── Roles Info ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {(Object.entries(ROLE_LABELS) as [TeamRole, string][]).map(([r, label]) => (
            <div key={r} className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5">
              <div className="mb-2">
                <RoleBadge role={r} />
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          ))}
        </div>

        {/* ─── Members List ─── */}
        <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-1">
            Team members
          </h2>
          <div>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>

      </div>

      {/* ─── Invite Modal ─── */}
      <Dialog open={inviteOpen} onOpenChange={(v) => { if (!v) { reset(); setInviteOpen(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111111]">Invite member</DialogTitle>
            <DialogDescription className="text-[#666666]">
              The new member will receive an email with instructions to join.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#111111]">Email</Label>
              <Input
                type="email"
                placeholder="name@company.com"
                className="border-[#E5E5E5] rounded-xl h-14 text-base"
                {...field("email")}
              />
              {errors.email && <p className="text-[#E5484D] text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#111111]">Role</Label>
              <Select value={role} onValueChange={(v) => setValue("role", v as InviteInput["role"])}>
                <SelectTrigger className="border-[#E5E5E5] rounded-xl h-14 px-4 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent sideOffset={8}>
                  {(["admin", "finance", "viewer"] as const).map((r) => (
                    <SelectItem key={r} value={r} className="py-3">
                      <span className="flex flex-col">
                        <span className="text-[#111111]">{ROLE_LABELS[r]}</span>
                        <span className="text-xs text-[#666666]">{ROLE_DESCRIPTIONS[r]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { reset(); setInviteOpen(false) }}
                className="flex-1 h-11 rounded-xl border-2 border-[#E5E5E5] bg-white px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-gray-50 hover:border-[#d0d0d0] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 gap-2 rounded-xl bg-[#7C3AED] px-5 text-sm font-semibold text-[#111111] shadow-sm hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all inline-flex items-center justify-center"
              >
                <RiMailSendLine className="size-4" />
                Send invitation
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
