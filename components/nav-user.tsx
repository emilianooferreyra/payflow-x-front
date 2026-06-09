"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { RiMoreLine, RiLogoutBoxLine, RiShieldLine } from "@remixicon/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getMe, logout } from "@/lib/api/auth"
import type { KycStatus } from "@/lib/api/auth"

const KYC_BADGE_LABEL: Record<KycStatus, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revisión",
  APPROVED: "Verificada",
  REJECTED: "Rechazada",
}

const KYC_BADGE_VARIANT: Record<KycStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  IN_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
}

function getInitials(name?: string, lastName?: string, email?: string): string {
  if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase()
  if (name) return name.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return "?"
}

export function NavUser() {
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <RiMoreLine className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="size-9 rounded-lg">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              {user?.kyc && (
                <div className="px-2 pb-2">
                  <Badge
                    variant={KYC_BADGE_VARIANT[user.kyc.status]}
                    className="gap-1 text-xs"
                  >
                    <RiShieldLine className="size-3" />
                    {KYC_BADGE_LABEL[user.kyc.status]}
                  </Badge>
                </div>
              )}
            </DropdownMenuLabel>

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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
