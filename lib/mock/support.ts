export interface FaqItem {
  question: string
  answer: string
}

export interface FaqCategory {
  id: string
  label: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    id: "account",
    label: "Account",
    items: [
      {
        question: "How do I verify my identity?",
        answer: "Go to Settings → Identity Verification and upload a government-issued ID plus a selfie. Verification takes 1–2 business days.",
      },
      {
        question: "Can I change my email address?",
        answer: "Yes. Go to Settings → Security, verify your current email and enter the new one. A confirmation link will be sent to both addresses.",
      },
      {
        question: "How do I enable two-factor authentication?",
        answer: "Go to Settings → Security → Two-Factor Authentication. Scan the QR code with an authenticator app like Google Authenticator or Authy.",
      },
    ],
  },
  {
    id: "deposits",
    label: "Deposits",
    items: [
      {
        question: "How long do deposits take?",
        answer: "Domestic ACH transfers take 1–2 business days. SWIFT international wires take 2–5 business days depending on the sending bank.",
      },
      {
        question: "Is there a minimum deposit amount?",
        answer: "There is no minimum deposit for USD. The deposit will be credited once it clears the banking network.",
      },
      {
        question: "Why is my deposit still pending?",
        answer: "Deposits may show as pending during processing. If it's been more than 5 business days, contact support with the wire confirmation number.",
      },
    ],
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    items: [
      {
        question: "How long do withdrawals take?",
        answer: "Domestic ACH withdrawals take 1–3 business days. Same-day wires are available for requests submitted before 2pm ET.",
      },
      {
        question: "What are the withdrawal fees?",
        answer: "ACH withdrawals are free. Domestic wires cost $5 per transfer. International SWIFT transfers cost $15.",
      },
      {
        question: "Is there a withdrawal limit?",
        answer: "Default daily limit is $50,000. Contact support to request a higher limit for verified business accounts.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    items: [
      {
        question: "What happens if I lose access to my 2FA device?",
        answer: "Contact support immediately. After identity verification, we can disable 2FA and guide you through re-enabling it on a new device.",
      },
      {
        question: "How do I report suspicious activity?",
        answer: "If you notice unauthorized transactions, freeze your account immediately from Settings and contact support via the emergency line.",
      },
    ],
  },
]

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high"

export interface SupportTicket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  lastMessage: string
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
}

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
}

export const mockTickets: SupportTicket[] = [
  {
    id: "TKT-1042",
    subject: "Wire transfer not received after 3 days",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-06-03T14:22:00Z",
    updatedAt: "2026-06-05T09:10:00Z",
    lastMessage: "Our team is coordinating with the sending bank. We'll update you within 24 hours.",
  },
  {
    id: "TKT-1038",
    subject: "How to add a team member with Finance role",
    status: "resolved",
    priority: "low",
    createdAt: "2026-05-28T11:00:00Z",
    updatedAt: "2026-05-28T16:45:00Z",
    lastMessage: "You can invite team members from the Team section in the sidebar. Select the Finance role during invitation.",
  },
  {
    id: "TKT-1031",
    subject: "Increase daily withdrawal limit",
    status: "closed",
    priority: "medium",
    createdAt: "2026-05-15T09:30:00Z",
    updatedAt: "2026-05-17T14:20:00Z",
    lastMessage: "Your daily withdrawal limit has been increased to $100,000. The change is now active.",
  },
]
