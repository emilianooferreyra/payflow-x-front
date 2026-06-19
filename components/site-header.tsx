"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getMe, logout } from "@/lib/api/auth"
import {
  RiGiftFill,
  RiLogoutBoxLine,
  RiSettings3Line,
  RiUserLine,
} from "@remixicon/react"

function getInitials(name?: string, lastName?: string, email?: string): string {
  if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase()
  if (name) return name.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return "?"
}

export function SiteHeader() {
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,
    onSettled() {
      router.push("/login")
    },
  })

  const displayName = [user?.name, user?.lastName].filter(Boolean).join(" ") || user?.email || "Usuario"
  const initials = getInitials(user?.name, user?.lastName, user?.email)

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b bg-white px-6">
      {/* Reward badge */}
      <Badge
        variant="secondary"
        className="hidden sm:inline-flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 text-sm font-semibold border-0 bg-[#111111]/10 text-[#111111] shadow-sm"
      >
        <RiGiftFill className="size-5" />
        <span>Referí y ganá</span>
      </Badge>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-9 ring-2 ring-[#E5E5E5]">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-[#111111]/10 text-[#111111] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl" side="bottom" align="end" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="size-9">
                {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/perfil")} className="gap-2">
            <RiUserLine className="size-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/seguridad")} className="gap-2">
            <RiSettings3Line className="size-4" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleLogout()}
            disabled={isPending}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <RiLogoutBoxLine className="size-4" />
            {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
