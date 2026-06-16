import { RiCheckLine, RiTimeLine, RiArrowDownLine } from "@remixicon/react"

interface Stage {
  label: string
  status: "completed" | "current" | "pending"
}

function getStages(type: string, status: string): Stage[] {
  if (type === "DEPOSIT" || type === "YIELD") {
    const done = status === "COMPLETED"
    return [
      { label: "Received", status: done ? "completed" : "current" },
      { label: "Settled", status: done ? "completed" : "pending" },
      { label: "Available", status: done ? "completed" : "pending" },
    ]
  }
  if (type === "WITHDRAWAL") {
    const done = status === "COMPLETED"
    return [
      { label: "Created", status: "completed" },
      { label: "Processing", status: done ? "completed" : "current" },
      { label: "Completed", status: done ? "completed" : "pending" },
    ]
  }
  return [
    { label: "Initiated", status: "completed" },
    { label: "Processing", status: status === "COMPLETED" ? "completed" : "current" },
    { label: "Completed", status: status === "COMPLETED" ? "completed" : "pending" },
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
                    ? "border-[#7C3AED] bg-[#7C3AED]"
                    : stage.status === "current"
                    ? "border-[#7C3AED] bg-white"
                    : "border-[#E5E5E5] bg-white"
                }`}
              >
                {stage.status === "completed" ? (
                  <RiCheckLine className="size-3 text-white" />
                ) : stage.status === "current" ? (
                  <span className="size-2 rounded-full bg-[#7C3AED]" />
                ) : null}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-6 ${
                    stage.status === "completed" ? "bg-[#7C3AED]" : "bg-[#E5E5E5]"
                  }`}
                />
              )}
            </div>
            {/* Label */}
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  stage.status === "completed"
                    ? "text-[#7C3AED]"
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
