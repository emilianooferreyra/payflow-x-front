"use client"

import { RiGlobalLine } from "@remixicon/react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function LanguageSelector() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="text-muted-foreground cursor-default">
          <RiGlobalLine className="size-4" />
          <span>Español</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
