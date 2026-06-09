"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiCustomerServiceLine, RiAddLine, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"
import {
  faqCategories,
  mockTickets,
  STATUS_LABELS,
  STATUS_COLORS,
  type SupportTicket,
} from "@/lib/mock/support"

const ticketSchema = z.object({
  subject: z.string().min(5, "Describe el problema en al menos 5 caracteres"),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
})
type TicketInput = z.infer<typeof ticketSchema>

function FaqCategory({ category }: { category: typeof faqCategories[0] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
        {category.label}
      </p>
      {category.items.map((item, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <button
            className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.question}
            {open === i
              ? <RiArrowUpSLine className="size-4 text-muted-foreground shrink-0" />
              : <RiArrowDownSLine className="size-4 text-muted-foreground shrink-0" />
            }
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-muted-foreground border-t bg-muted/20 pt-3">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-xl overflow-hidden mb-2">
      <button
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
          <span className="text-sm font-medium">{ticket.subject}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
            {STATUS_LABELS[ticket.status]}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(ticket.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </span>
          {expanded
            ? <RiArrowUpSLine className="size-4 text-muted-foreground" />
            : <RiArrowDownSLine className="size-4 text-muted-foreground" />
          }
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t bg-muted/20 pt-3">
          <p className="text-xs text-muted-foreground mb-1">Última actualización</p>
          <p className="text-sm">{ticket.lastMessage}</p>
        </div>
      )}
    </div>
  )
}

export default function SoportePage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [searchFaq, setSearchFaq] = useState("")

  const { register: field, handleSubmit, reset, formState: { errors } } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
  })

  function onSubmit(data: TicketInput) {
    const newTicket: SupportTicket = {
      id: `TKT-${1000 + tickets.length + 1}`,
      subject: data.subject,
      status: "open",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: data.message,
    }
    setTickets((prev) => [newTicket, ...prev])
    toast.success("Ticket creado. Te responderemos pronto.")
    reset()
  }

  const filteredFaq = searchFaq.trim()
    ? faqCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchFaq.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchFaq.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqCategories

  return (
    <main className="flex flex-1 flex-col">

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <RiCustomerServiceLine className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Soporte</h1>
              <p className="text-sm text-muted-foreground">Centro de ayuda y tickets</p>
            </div>
          </div>

          <Tabs defaultValue="faq">
            <TabsList>
              <TabsTrigger value="faq">Centro de ayuda</TabsTrigger>
              <TabsTrigger value="tickets">
                Mis tickets
                {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length > 0 && (
                  <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-semibold">
                    {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="nuevo">Nuevo ticket</TabsTrigger>
            </TabsList>

            {/* FAQ */}
            <TabsContent value="faq" className="mt-4">
              <div className="mb-4">
                <Input
                  placeholder="Buscar en el centro de ayuda..."
                  value={searchFaq}
                  onChange={(e) => setSearchFaq(e.target.value)}
                  className="max-w-md"
                />
              </div>
              {filteredFaq.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No encontramos resultados para "{searchFaq}".
                </p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {filteredFaq.map((cat) => (
                    <FaqCategory key={cat.id} category={cat} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tickets list */}
            <TabsContent value="tickets" className="mt-4">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No tenés tickets abiertos.</p>
              ) : (
                <div>
                  {tickets.map((ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* New ticket form */}
            <TabsContent value="nuevo" className="mt-4">
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle className="text-base">Crear nuevo ticket</CardTitle>
                  <CardDescription>
                    Describí tu consulta y te responderemos en menos de 24 horas hábiles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Asunto</Label>
                      <Input placeholder="Ej: No puedo realizar un retiro" {...field("subject")} />
                      {errors.subject && <p className="text-destructive text-xs">{errors.subject.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mensaje</Label>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        placeholder="Describí el problema con el mayor detalle posible..."
                        {...field("message")}
                      />
                      {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <RiAddLine className="size-4" />
                      Enviar ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
  )
}
