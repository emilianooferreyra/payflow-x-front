"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"
import { RiCheckboxCircleLine } from "@remixicon/react"

const schema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    lastName: z.string().min(1, "El apellido es obligatorio"),
    email: z.string().email("Ingresá un email válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _, ...payload }: FormValues) =>
      register(payload),
  })

  if (mutation.isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-4 p-6 text-center md:p-8">
              <div className="flex size-16 items-center justify-center rounded-full bg-positive/10">
                <RiCheckboxCircleLine className="size-8 text-positive" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">¡Cuenta creada!</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenido a PayFlow. Ya podés iniciar sesión.
                </p>
              </div>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Iniciar sesión
              </Button>
            </div>
            <div className="relative hidden flex-col items-start justify-end bg-sidebar p-10 md:flex">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 via-primary/5 to-sidebar" />
              <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle,_currentColor_1px,_transparent_1px)] [background-size:24px_24px]" />
              <div className="relative space-y-2">
                <p className="text-3xl font-bold">PayFlow</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Tu cuenta está lista. Empezá a gestionar tu dinero.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Creá tu cuenta</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Empezá a gestionar tu dinero con PayFlow
                </p>
              </div>

              {mutation.isError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                  {getErrorMessage(mutation.error)}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Nicolás" {...field("name")} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Rodríguez" {...field("lastName")} />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                  {...field("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Creando cuenta…" : "Crear cuenta"}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  O continuá con
                </span>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => { window.location.href = "/api/v1/auth/google" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Registrarse con Google
              </Button>

              <p className="text-center text-sm">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>

          <div className="relative hidden flex-col items-start justify-end bg-sidebar p-10 md:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 via-primary/5 to-sidebar" />
            <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle,_currentColor_1px,_transparent_1px)] [background-size:24px_24px]" />
            <div className="relative space-y-2">
              <p className="text-3xl font-bold">PayFlow</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Recibí USD, convertí a ARS o USDT, y hacé crecer tu dinero con rendimiento diario — creado para freelancers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground px-6 text-center text-xs">
        Al crear una cuenta aceptás nuestros{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Términos y condiciones
        </Link>{" "}
        y{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  )
}
