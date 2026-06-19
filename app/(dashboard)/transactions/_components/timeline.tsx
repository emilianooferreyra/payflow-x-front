import { RiCheckLine, RiTimeLine, RiArrowDownLine } from "@remixicon/react"

interface Stage {
  label: string
  status: "completed" | "current" | "pending"
}

function getStages(type: string, status: string): Stage[] {
  if (type === "DEPOSIT" || type === "YIELD") {
    const done = status === "COMPLETED"
    return [
      { label: "Recibido", status: done ? "completed" : "current" },
      { label: "Liquidado", status: done ? "completed" : "pending" },
      { label: "Disponible", status: done ? "completed" : "pending" },
    ]
  }
  if (type === "WITHDRAWAL") {
    const done = status === "COMPLETED"
    return [
      { label: "Creado", status: "completed" },
      { label: "Procesando", status: done ? "completed" : "current" },
      { label: "Completado", status: done ? "completed" : "pending" },
    ]
  }
  return [
    { label: "Iniciado", status: "completed" },
    { label: "Procesando", status: status === "COMPLETED" ? "completed" : "current" },
    { label: "Completado", status: status === "COMPLETED" ? "completed" : "pending" },
  ]
}

interface TransactionTimelineProps {
  type: string
  status: string
}

export function TransactionTimeline({ type, status }: TransactionTimelineProps) {
  const stages = getStages(type, status)

  return (
    <div className="flex flex-col items-start gap-0">
      {stages.map((stage, i) => {
        const isLast = i === stages.length - 1
        return (
          <div key={stage.label} className="flex items-start gap-3">
            {/* Connector column */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  stage.status === "completed"
                    ? "border-[#111111] bg-[#111111]"
                    : stage.status === "current"
                    ? "border-[#111111] bg-white"
                    : "border-[#E5E5E5] bg-white"
                }`}
              >
                {stage.status === "completed" ? (
                  <RiCheckLine className="size-3 text-white" />
                ) : stage.status === "current" ? (
                  <span className="size-2 rounded-full bg-[#111111]" />
                ) : null}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-6 ${
                    stage.status === "completed" ? "bg-[#111111]" : "bg-[#E5E5E5]"
                  }`}
                />
              )}
            </div>
            {/* Label */}
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  stage.status === "completed"
                    ? "text-[#111111]"
                    : stage.status === "current"
                    ? "text-[#111111]"
                    : "text-[#999999]"
                }`}
              >
                {stage.label}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
