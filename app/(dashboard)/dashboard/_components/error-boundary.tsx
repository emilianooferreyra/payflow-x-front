"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { RiAlertLine, RiRefreshLine } from "@remixicon/react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error)
    console.error("[section error]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <RiAlertLine className="size-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">Algo salió mal</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Esta sección no pudo cargarse.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="gap-1.5"
          >
            <RiRefreshLine className="size-3.5" />
            Retry
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
