export type TeamRole = "owner" | "admin" | "finance" | "viewer"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  joinedAt: string
  lastActive: string
  avatarInitials: string
}

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  finance: "Finance",
  viewer: "Viewer",
}

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: "Full access, billing and account deletion",
  admin: "Full access except billing and deletion",
  finance: "View and manage transactions and balances",
  viewer: "View-only access to all data",
}

export const ROLE_COLORS: Record<TeamRole, string> = {
  owner: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  finance: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  viewer: "bg-muted text-muted-foreground",
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Emiliano Ferreyra",
    email: "emiliano@craftbeats.dev",
    role: "owner",
    joinedAt: "2026-03-09",
    lastActive: "2026-06-07",
    avatarInitials: "EF",
  },
  {
    id: "2",
    name: "Laura Sánchez",
    email: "laura.sanchez@contadora.com.ar",
    role: "finance",
    joinedAt: "2026-05-28",
    lastActive: "2026-06-05",
    avatarInitials: "LS",
  },
]
