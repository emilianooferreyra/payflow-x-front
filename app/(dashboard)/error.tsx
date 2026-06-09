"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RiAlertLine, RiRefreshLine, RiHomeLine } from "@remixicon/react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <RiAlertLine className="size-7 text-destructive" />
          </div>

          <div>
            <h2 className="text-base font-semibold">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {process.env.NODE_ENV === "development"
                ? error.message
                : "An unexpected error occurred. Please try again."}
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-muted-foreground/60">
                {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={reset} size="sm" className="gap-1.5">
              <RiRefreshLine className="size-4" />
              Try again
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard" className="gap-1.5">
                <RiHomeLine className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
