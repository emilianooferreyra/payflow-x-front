"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { verifyTwoFactor } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  code: z
    .string()
    .length(6, "El código debe tener exactamente 6 dígitos")
    .regex(/^\d+$/, "El código debe contener solo dígitos"),
})

type FormValues = z.infer<typeof schema>

export default function TwoFactorPage() {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: ({ code }: FormValues) => verifyTwoFactor(code),
    onSuccess() {
      router.push("/dashboard")
    },
  })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form
                className="p-6 md:p-8"
                onSubmit={handleSubmit((v) => mutation.mutate(v))}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Autenticación de dos factores</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      Ingresá el código de 6 dígitos de tu app de autenticación
                    </p>
                  </div>

                  {mutation.isError && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                      {getErrorMessage(mutation.error, "Código inválido")}
                    </p>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="code">Código de autenticación</Label>
                    <Input
                      id="code"
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      className="text-center tracking-[0.5em] text-lg"
                      {...register("code")}
                    />
                    {errors.code && (
                      <p className="text-xs text-destructive">{errors.code.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Verificando…" : "Verificar"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    ¿Problemas?{" "}
                    <Link href="/login" className="text-foreground underline underline-offset-4">
                      Volver a iniciar sesión
                    </Link>
                  </p>
                </div>
              </form>

              <div className="relative hidden flex-col items-start justify-end bg-sidebar p-10 md:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-sidebar to-sidebar" />
                <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle,_currentColor_1px,_transparent_1px)] [background-size:24px_24px]" />
                <div className="relative space-y-2">
                  <p className="text-3xl font-bold">PayFlow</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Abrí Google Authenticator, Microsoft Authenticator o cualquier app compatible para obtener tu código.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground px-6 text-center text-xs">
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
