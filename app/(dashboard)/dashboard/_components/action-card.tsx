"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { RiArrowRightSLine } from "@remixicon/react"
import type { RemixiconComponentType } from "@remixicon/react"

interface ActionCardProps {
  href: string
  icon: RemixiconComponentType
  title: string
  description: string
}

export function ActionCard({ href, icon: Icon, title, description }: ActionCardProps) {
  return (
    <Link href={href}>
      <Card className="border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
        <CardContent className="flex items-center gap-4 px-5 py-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
          <RiArrowRightSLine className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>
    </Link>
  )
}
