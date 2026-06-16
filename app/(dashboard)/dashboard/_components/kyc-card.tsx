"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RiShieldLine, RiArrowRightSLine, RiCheckboxCircleLine } from "@remixicon/react"
import type { KycStatus } from "@/lib/api/auth"

interface KycCardProps {
  status: KycStatus
  description: string
  badgeLabel: string
  badgeVariant: "default" | "secondary" | "outline" | "destructive"
}

const STATUS_CONFIG: Record<KycStatus, { badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { badgeVariant: "outline" },
  IN_REVIEW: { badgeVariant: "secondary" },
  APPROVED: { badgeVariant: "default" },
  REJECTED: { badgeVariant: "destructive" },
}

export function KycCard({ status }: { status: KycStatus }) {
  if (status === "APPROVED") return null

  const config = STATUS_CONFIG[status]
  const descriptions: Record<KycStatus, string> = {
    PENDING: "Complete your identity verification to operate",
    IN_REVIEW: "We are reviewing your documentation",
    APPROVED: "",
    REJECTED: "Please resubmit your documentation",
  }

  return (
    <Link href="/kyc" className="block mb-6">
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-3 p-4">
          <RiShieldLine className="size-5 text-warning shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{descriptions[status]}</p>
          </div>
          <Badge variant={config.badgeVariant} className="rounded-full px-3">
            {status === "PENDING" ? "Pending" : status === "IN_REVIEW" ? "In review" : status}
          </Badge>
          <RiArrowRightSLine className="size-4 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
