"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#fafafa" }}>
        <div
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>⚠️</div>
          <div>
            <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, color: "#111" }}>
              Something went wrong
            </h1>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
              An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#999" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.375rem",
                border: "none",
                background: "#111",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#111",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
