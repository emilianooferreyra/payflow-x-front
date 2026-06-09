"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { forgotPassword, resetPassword } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ─── Step 1: email ────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

type EmailValues = z.infer<typeof emailSchema>

function StepEmail({ onSuccess }: { onSuccess: (email: string) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  })

  const mutation = useMutation({
    mutationFn: (values: EmailValues) => forgotPassword(values.email),
    onSuccess(_, values) {
      onSuccess(values.email)
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a 6-digit code
          </p>
        </div>

        {mutation.isError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send code"}
        </Button>

        <p className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}

// ─── Step 2: OTP + new password ───────────────────────────────────────────────

const resetSchema = z
  .object({
    code: z.string().length(6, "Code must be exactly 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetValues = z.infer<typeof resetSchema>

function StepReset({ email }: { email: string }) {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  })

  const mutation = useMutation({
    mutationFn: ({ code, password }: ResetValues) =>
      resetPassword({ email, code, password }),
    onSuccess() {
      router.push("/login")
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-balance text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
          </p>
        </div>

        {mutation.isError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        {mutation.isSuccess && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-400">
            Password changed — redirecting…
          </p>
        )}

        <div className="grid gap-2">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            placeholder="123456"
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending || mutation.isSuccess}>
          {mutation.isPending ? "Resetting…" : "Reset password"}
        </Button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string | null>(null)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                {email === null
                  ? <StepEmail onSuccess={setEmail} />
                  : <StepReset email={email} />
                }
              </div>

              <div className="relative hidden flex-col items-start justify-end bg-sidebar p-10 md:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-sidebar to-sidebar" />
                <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle,_currentColor_1px,_transparent_1px)] [background-size:24px_24px]" />
                <div className={cn("relative space-y-2 transition-all duration-300", email && "translate-y-0")}>
                  <p className="text-3xl font-bold">PayFlow</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    {email
                      ? "Enter the code from your email and choose a new password."
                      : "We'll send a code to your email. It expires in 10 minutes."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground px-6 text-center text-xs">
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
