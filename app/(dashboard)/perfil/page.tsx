"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTheme, type Theme } from "@/components/theme-provider"
import { toast } from "sonner"
import {
  RiPencilLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiFileCopyLine,
} from "@remixicon/react"
import { Input } from "@/components/ui/input"
import { getMe, updateMe } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

const THEMES = [
  {
    id: "light",
    label: "Claro",
    preview: (
      <div className="w-full h-full bg-white rounded-t-md border border-[#E5E5E5]/60 overflow-hidden">
        <div className="h-2 bg-gray-100 border-b border-[#E5E5E5]/40 flex items-center gap-0.5 px-1">
          <span className="size-0.5 rounded-full bg-gray-300" />
          <span className="size-0.5 rounded-full bg-gray-300" />
        </div>
        <div className="p-1 flex gap-1">
          <div className="w-3 flex flex-col gap-0.5">
            <div className="h-0.5 w-full bg-gray-200 rounded" />
            <div className="h-0.5 w-full bg-gray-200 rounded" />
            <div className="h-0.5 w-full bg-gray-300 rounded" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1.5 w-full bg-gray-100 rounded" />
            <div className="h-1.5 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "dark",
    label: "Oscuro",
    preview: (
      <div className="w-full h-full bg-zinc-900 rounded-t-md border border-zinc-700 overflow-hidden">
        <div className="h-2 bg-zinc-800 border-b border-zinc-700 flex items-center gap-0.5 px-1">
          <span className="size-0.5 rounded-full bg-zinc-600" />
          <span className="size-0.5 rounded-full bg-zinc-600" />
        </div>
        <div className="p-1 flex gap-1">
          <div className="w-3 flex flex-col gap-0.5">
            <div className="h-0.5 w-full bg-zinc-700 rounded" />
            <div className="h-0.5 w-full bg-zinc-700 rounded" />
            <div className="h-0.5 w-full bg-gray-600 rounded" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1.5 w-full bg-zinc-800 rounded" />
            <div className="h-1.5 w-3/4 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "system",
    label: "Sistema",
    preview: (
      <div className="w-full h-full rounded-t-md border border-[#E5E5E5]/60 overflow-hidden flex">
        <div className="w-1/2 bg-white" />
        <div className="w-1/2 bg-zinc-900" />
        <div className="absolute inset-0 flex flex-col">
          <div className="h-2 bg-gradient-to-r from-gray-100 to-zinc-800 border-b border-[#E5E5E5]/20 flex items-center gap-0.5 px-1">
            <span className="size-0.5 rounded-full bg-gray-400" />
            <span className="size-0.5 rounded-full bg-gray-400" />
          </div>
          <div className="flex-1 p-1 flex gap-1">
            <div className="w-3 flex flex-col gap-0.5">
              <div className="h-0.5 w-full bg-gray-300 rounded" />
              <div className="h-0.5 w-full bg-gray-300 rounded" />
              <div className="h-0.5 w-full bg-gray-400 rounded" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="h-1.5 w-full bg-gray-200/50 rounded" />
              <div className="h-1.5 w-3/4 bg-gray-200/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-14">
      <h3 className="text-sm font-semibold text-[#666666] tracking-wide uppercase mb-5">{title}</h3>
      <div className="divide-y divide-[#E5E5E5] rounded-2xl border-2 border-[#E5E5E5] bg-white">
        {children}
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  onAction,
  actionIcon,
}: {
  label: string
  value?: string | null
  onAction?: () => void
  actionIcon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-[#666666] mt-0.5">{value || "--"}</p>
      </div>
      {onAction && (
        <button
          className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all shrink-0"
          onClick={onAction}
        >
          {actionIcon ?? <RiArrowRightSLine className="size-4" />}
        </button>
      )}
    </div>
  )
}

export default function PerfilPage() {
  const qc = useQueryClient()
  const { theme, setTheme } = useTheme()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [copied, setCopied] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  })

  const { mutate: saveName, isPending: savingName } = useMutation({
    mutationFn: (name: string) => {
      const [first, ...rest] = name.trim().split(" ")
      return updateMe({ name: first, lastName: rest.join(" ") || undefined })
    },
    onSuccess(updated) {
      qc.setQueryData(["me"], updated)
      toast.success("Nombre actualizado")
      setEditingName(false)
    },
    onError() {
      toast.error("No se pudo actualizar el nombre")
    },
  })

  function startEditName() {
    const full = [user?.name, user?.lastName].filter(Boolean).join(" ")
    setNameValue(full)
    setEditingName(true)
  }

  function copyId() {
    if (!user?.id) return
    navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayName = [user?.name, user?.lastName].filter(Boolean).join(" ") || "—"
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    : "—"

  const activeTheme = theme === "system" || !theme ? "system" : theme

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">

        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-2 rounded-full bg-[#111111]" />
            <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
              PERFIL
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
            Perfil
          </h1>
          <p className="mt-3 max-w-lg text-lg text-[#666666] leading-relaxed">
            Administrá tu información personal y preferencias.
          </p>
        </div>

        {/* Nombre */}
        <SectionCard title="Nombre">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-0.5">Nombre</p>
                {editingName ? (
                  <Input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(nameValue)
                      if (e.key === "Escape") setEditingName(false)
                    }}
                    className="h-8 text-sm mt-1 max-w-xs"
                    disabled={savingName}
                  />
                ) : (
                  <p className="text-sm text-[#666666]">{isLoading ? "—" : displayName}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {editingName ? (
                  <>
                    <button
                      className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all"
                      onClick={() => setEditingName(false)}
                      disabled={savingName}
                    >
                      <RiCloseLine className="size-4" />
                    </button>
                    <button
                      className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all"
                      onClick={() => saveName(nameValue)}
                      disabled={savingName || !nameValue.trim()}
                    >
                      <RiCheckLine className="size-4" />
                    </button>
                  </>
                ) : (
                  <button
                    className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all"
                    onClick={startEditName}
                  >
                    <RiPencilLine className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Cuenta */}
        <SectionCard title="Cuentasss">
          <InfoRow
            label="Correo electrónico"
            value={user?.email}
            onAction={() => toast.info("Próximamente")}
          />
          <InfoRow
            label="Teléfono"
            value={user?.phone}
            onAction={() => toast.info("Próximamente")}
          />
          <InfoRow label="Miembro desde" value={memberSince} />
        </SectionCard>

        {/* Preferencias */}
        <SectionCard title="Preferencias">
          <div className="px-4 py-4">
            <p className="text-sm font-medium mb-0.5">Tema de la aplicación</p>
            <p className="text-sm text-[#666666] mb-4">Selecciona un tema</p>
            <div className="flex gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as Theme)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      "relative w-20 h-14 rounded-md overflow-hidden ring-2 transition-all",
                      activeTheme === t.id
                        ? "ring-[#111111]"
                        : "ring-[#E5E5E5] group-hover:ring-[#666666]/40",
                    )}
                  >
                    {t.preview}
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      activeTheme === t.id ? "text-[#111111] font-medium" : "text-[#666666]",
                    )}
                  >
                    {activeTheme === t.id && <RiCheckLine className="size-3" />}
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ID de usuario */}
        <SectionCard title="ID de usuario">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium mb-0.5">ID de usuario</p>
              <p className="text-xs text-[#666666] font-mono truncate">{user?.id ?? "—"}</p>
            </div>
            <button
              className="flex size-9 items-center justify-center rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-all shrink-0 ml-4"
              onClick={copyId}
              disabled={!user?.id}
            >
              <RiFileCopyLine className={cn("size-4", copied && "text-[#059669]")} />
            </button>
          </div>
        </SectionCard>

      </div>
    </main>
  )
}
