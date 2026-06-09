"use client"

import { useState } from "react"
import { RiGlobalLine, RiArrowDownSLine } from "@remixicon/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const locales = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
]

export function LanguageSelector() {
  const [locale, setLocale] = useState("en")
  const current = locales.find((l) => l.value === locale) ?? locales[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="text-muted-foreground">
              <RiGlobalLine className="size-4" />
              <span>{current.label}</span>
              <RiArrowDownSLine className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-36">
            {locales.map((l) => (
              <DropdownMenuItem
                key={l.value}
                onClick={() => setLocale(l.value)}
                className={l.value === locale ? "font-medium" : ""}
              >
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
