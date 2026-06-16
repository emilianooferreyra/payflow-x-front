"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  RiHome4Line,
  RiArrowDownCircleLine,
  RiArrowUpCircleLine,
  RiExchange2Line,
  RiMoneyDollarCircleLine,
  RiBarChartBoxLine,
  RiBookmark3Line,
  RiTeamLine,
  RiShieldLine,
  RiUserLine,
  RiLockLine,
  RiCustomerService2Line,
  RiGlobalLine,
  RiArrowDownSLine,
} from "@remixicon/react"

const sections = [
  {
    label: "Main",
    items: [
      { title: "Inicio",        url: "/dashboard",     icon: RiHome4Line },
      { title: "Depositar",     url: "/depositar",     icon: RiArrowDownCircleLine },
      { title: "Retirar",       url: "/retirar",       icon: RiArrowUpCircleLine },
      { title: "Transacciones", url: "/transacciones",  icon: RiExchange2Line },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Pagos",         url: "/pagos",         icon: RiMoneyDollarCircleLine },
      { title: "Inversiones",   url: "/investments",   icon: RiBarChartBoxLine },
      { title: "Beneficiarios", url: "/beneficiaries",  icon: RiBookmark3Line },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Equipo",        url: "/equipo",        icon: RiTeamLine },
      { title: "Verificación",  url: "/kyc",           icon: RiShieldLine },
      { title: "Perfil",        url: "/perfil",        icon: RiUserLine },
      { title: "Seguridad",     url: "/seguridad",      icon: RiLockLine },
      { title: "Soporte",       url: "/soporte",       icon: RiCustomerService2Line },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  function isActive(url: string) {
    if (url === "/dashboard") return pathname === url
    return pathname === url || pathname.startsWith(url + "/")
  }

  return (
    <Sidebar collapsible="offcanvas" className="bg-white border-0" {...props}>
      <SidebarHeader className="p-4 border-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-base font-bold tracking-tight text-[#111111]">PayFlow</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-3 py-2">
          {sections.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="px-2 py-1 text-[11px] font-semibold text-[#666666] tracking-widest uppercase">
                {section.label}
              </p>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.url)
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`${
                          active
                            ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9] hover:text-white data-active:bg-[#7C3AED] data-active:text-white"
                            : "text-[#666666] hover:bg-[#F5F5F5] hover:text-[#111111]"
                        }`}
                      >
                        <Link href={item.url}>
                          <item.icon className={active ? "text-white" : "text-[#666666]"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </div>
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Language selector */}
      <SidebarFooter className="p-3 border-0">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#666666] hover:bg-[#F5F5F5] hover:text-[#111111] transition-colors">
          <RiGlobalLine className="size-4 shrink-0" />
          <span className="flex-1 text-left">English</span>
          <RiArrowDownSLine className="size-3.5" />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
