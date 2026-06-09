import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-5">
        {/* Actualizar button */}
        <div className="flex justify-end">
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Hero row: Balance + Quick actions */}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-9 w-9 rounded-sm" />
              <Skeleton className="mb-4 h-12 w-56" />
              <Skeleton className="h-5 w-44" />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 px-4">
                  <Skeleton className="size-12 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="size-4 shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rendimientos */}
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 px-4">
                  <Skeleton className="size-12 shrink-0 rounded-sm" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Historial mensual */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
