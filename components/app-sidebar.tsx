"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  RiHomeLine,
  RiArrowDownCircleLine,
  RiArrowUpCircleLine,
  RiExchangeLine,
  RiTeamLine,
  RiCustomerServiceLine,
  RiUserLine,
  RiShieldUserLine,
  RiShieldLine,
  RiBankCardLine,
  RiLockLine,
} from "@remixicon/react"

const mainNav = [
  { title: "Inicio",        url: "/dashboard",    icon: RiHomeLine },
  { title: "Depositar",     url: "/depositar",    icon: RiArrowDownCircleLine },
  { title: "Retirar",       url: "/retirar",      icon: RiArrowUpCircleLine },
  { title: "Transacciones", url: "/transactions", icon: RiExchangeLine },
  { title: "Equipo",        url: "/equipo",       icon: RiTeamLine },
  { title: "Soporte",       url: "/soporte",      icon: RiCustomerServiceLine },
]

const profileNav = [
  { title: "Perfil",                url: "/perfil",     icon: RiUserLine },
  { title: "Verificación de identidad", url: "/kyc",   icon: RiShieldUserLine },
  { title: "Datos y privacidad",    url: "/datos",      icon: RiShieldLine },
  { title: "Pagos y suscripciones", url: "/pagos",      icon: RiBankCardLine },
  { title: "Seguridad",             url: "/seguridad",  icon: RiLockLine },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  function isActive(url: string) {
    if (url === "/dashboard") return pathname === url
    return pathname === url || pathname.startsWith(url + "/")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  P
                </span>
                <span className="text-base font-semibold">PayFlow</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-2 gap-0.5">
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

 

        <SidebarMenu className="px-2 pb-2 gap-0.5">
          {profileNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
