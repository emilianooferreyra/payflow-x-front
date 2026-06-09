/**
 * Simulation data for Emiliano Ferreyra — freelancer using PayFlow.
 *
 * All numbers are derived from and consistent with the backend seed.ts:
 *   Wallets   → USD $1,842.50 | ARS $415,000 | USDT $1,200
 *   Portfolio → AAPL 3.5 | NVDA 0.8 | SPY 2.0 | MSFT 1.5
 *   History   → 3 months (March → June 2026), daily yield accruals
 *
 * This file drives pages that have no dedicated API:
 *   Notifications · Deposit history · Withdrawal history · Chat · Dashboard metrics
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type TxType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "EXCHANGE"
  | "YIELD"
  | "INVESTMENT_BUY"
  | "INVESTMENT_SELL"
  | "TRANSFER"

export type NotifType = "deposit" | "withdrawal" | "yield" | "alert" | "team" | "info"
export type DepositStatus = "pending" | "completed" | "rejected"
export type WithdrawalStatus = "processing" | "completed" | "failed"

export interface ScenarioTransaction {
  id: string
  type: TxType
  status: TxStatus
  amount: number
  currency: "USD" | "ARS" | "USDT"
  description: string
  category?: string
  metadata?: { rate?: number; received?: number; toCurrency?: string; apy?: string; period?: string }
  createdAt: string
}

export interface MockNotification {
  id: string
  type: NotifType
  title: string
  body: string
  read: boolean
  createdAt: string
  href?: string
}

export interface DepositEntry {
  id: string
  amount: number
  currency: string
  from: string
  reference: string
  status: DepositStatus
  method: "ACH" | "SWIFT" | "WIRE"
  estimatedArrival?: string
  createdAt: string
}

export interface WithdrawalEntry {
  id: string
  amount: number
  currency: string
  destination: string
  destinationLast4: string
  fee: number
  net: number
  status: WithdrawalStatus
  createdAt: string
  failureReason?: string
}

export interface Beneficiary {
  id: string
  label: string
  name: string
  bankName: string
  accountNumber: string
  accountLast4: string
  currency: "USD" | "ARS" | "USDT"
  country: string
}

export interface ChatMessage {
  id: string
  from: "user" | "support"
  senderName: string
  text: string
  createdAt: string
}

// ── Wallets (mirrors seed.ts exact balances) ──────────────────────────────────

export const mockWallets = [
  { id: "wallet_usd", currency: "USD", balance: 1842.50 },
  { id: "wallet_ars", currency: "ARS", balance: 415000 },
  { id: "wallet_usdt", currency: "USDT", balance: 1200.00 },
]

// ── Assets (mirrors seed.ts: stocks, ETF, commodity — no crypto) ─────────────

export const mockAssets = [
  { symbol: "AAPL",  name: "Apple Inc.",            type: "STOCK",     currentPrice: 195.50, dailyChange:  1.24 },
  { symbol: "GOOGL", name: "Alphabet Inc.",          type: "STOCK",     currentPrice: 178.30, dailyChange: -0.43 },
  { symbol: "NVDA",  name: "NVIDIA Corporation",     type: "STOCK",     currentPrice: 875.40, dailyChange:  3.71 },
  { symbol: "MSFT",  name: "Microsoft Corporation",  type: "STOCK",     currentPrice: 418.20, dailyChange:  0.87 },
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",       type: "ETF",       currentPrice: 548.60, dailyChange:  0.31 },
  { symbol: "XAU",   name: "Gold",                   type: "COMMODITY", currentPrice: 3280.00, dailyChange: -0.15 },
]

// ── Investments (mirrors seed.ts portfolio) ───────────────────────────────────
// Cost basis:    3.5×182 + 0.8×720 + 2.0×510 + 1.5×390 = $2,818.00
// Current value: 3.5×195.50 + 0.8×875.40 + 2.0×548.60 + 1.5×418.20 = $3,109.07
// Total P&L:     $291.07 (+10.33%)

export const mockInvestments = [
  {
    asset: { symbol: "AAPL", name: "Apple Inc.", currentPrice: 195.50 },
    quantity: 3.5, avgBuyPrice: 182.00,
    currentValue: 684.25, pnl: 47.25, pnlPercent: 7.42,
  },
  {
    asset: { symbol: "NVDA", name: "NVIDIA Corporation", currentPrice: 875.40 },
    quantity: 0.8, avgBuyPrice: 720.00,
    currentValue: 700.32, pnl: 124.32, pnlPercent: 21.58,
  },
  {
    asset: { symbol: "SPY", name: "SPDR S&P 500 ETF", currentPrice: 548.60 },
    quantity: 2.0, avgBuyPrice: 510.00,
    currentValue: 1097.20, pnl: 77.20, pnlPercent: 7.57,
  },
  {
    asset: { symbol: "MSFT", name: "Microsoft Corporation", currentPrice: 418.20 },
    quantity: 1.5, avgBuyPrice: 390.00,
    currentValue: 627.30, pnl: 42.30, pnlPercent: 7.23,
  },
]

// ── Dashboard metrics (pre-computed, used for dashboard cards) ────────────────
// Liquid USD:  $1,842.50 + $1,200.00 (USDT ≈ USD) = $3,042.50
// Net worth:   liquid + portfolio = $3,042.50 + $3,109.07 = $6,151.57
// Yield APY:   USD 0.01%/day ≈ 3.65% | USDT 0.008%/day ≈ 2.9%
// Yield total: ~$8.42 USD + ~$2.89 USDT over 90 days (compound daily accrual)

export const mockDashboardMetrics = {
  liquidUsd: 3042.50,
  arsBalance: 415000,
  investmentValue: 3109.07,
  investmentCost: 2818.00,
  investmentPnl: 291.07,
  investmentPnlPercent: 10.33,
  totalNetWorth: 6151.57,
  monthlyIncomeUsd: 2800,       // Last month: Proyecto web fase 2
  yieldUsd: 8.42,               // 90-day USD yield (0.01%/day compound)
  yieldUsdt: 2.89,              // 90-day USDT yield (0.008%/day compound)
  usdApy: 3.65,
  usdtApy: 2.90,
  pendingDepositUsd: 1400,      // SWIFT from Bright Creative Studio
  processingWithdrawalUsd: 200, // USD withdrawal in flight
}

// ── Balance history — liquid USD+USDT equivalent, end of month ───────────────
// Mar: joined platform, first deposit at month end → ~$0 start
// Abr: 2000 deposit - 1000 ARS exchange - 400 USDT exchange + yield → ~$1,100 liquid
// May: 3500 deposit - 1500 ARS exchange - 800 USDT exchange + yield → ~$2,150 liquid
// Jun: 2800 deposit - 1000 ARS exchange - 1000 USDT exchange + yield → $3,042.50 liquid

export const mockBalanceHistory = [
  { month: "Mar '26", balance: 0 },
  { month: "Abr '26", balance: 1100 },
  { month: "May '26", balance: 2150 },
  { month: "Jun '26", balance: 3042.50 },
]

// ── Portfolio distribution for pie chart ─────────────────────────────────────

export const mockPortfolioDistribution = [
  { name: "USD",  value: 1842.50, color: "#8b5cf8" },
  { name: "USDT", value: 1200.00, color: "#06b6d4" },
  { name: "AAPL", value: 684.25,  color: "#10b981" },
  { name: "NVDA", value: 700.32,  color: "#f59e0b" },
  { name: "SPY",  value: 1097.20, color: "#3b82f6" },
  { name: "MSFT", value: 627.30,  color: "#ec4899" },
]

// ── Representative transactions ───────────────────────────────────────────────
// The seed generates 180+ daily yield rows. This list covers the key story beats
// for pages that display transaction history with context.

export const mockTransactions: ScenarioTransaction[] = [
  // ── Today ──────────────────────────────────────────────────────────────────
  {
    id: "tx_yield_usd_today",
    type: "YIELD", status: "COMPLETED", amount: 0.1842, currency: "USD",
    description: "Rendimiento diario USD",
    metadata: { apy: "3.65%", period: "daily" },
    createdAt: "2026-06-07T00:05:00Z",
  },
  {
    id: "tx_yield_usdt_today",
    type: "YIELD", status: "COMPLETED", amount: 0.0960, currency: "USDT",
    description: "Rendimiento diario USDT",
    metadata: { apy: "2.9%", period: "daily" },
    createdAt: "2026-06-07T00:05:00Z",
  },
  {
    id: "tx_wd_pending",
    type: "WITHDRAWAL", status: "PENDING", amount: 200, currency: "USD",
    description: "Retiro USD — Santander ···8821",
    createdAt: "2026-06-07T09:00:00Z",
  },

  // ── Mes 3 — hace ~30 días (mayo 2026) ──────────────────────────────────────
  {
    id: "tx_014",
    type: "DEPOSIT", status: "COMPLETED", amount: 2800, currency: "USD",
    description: "Nova Digital · Invoice INV-2026-0012",
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "tx_015",
    type: "EXCHANGE", status: "COMPLETED", amount: 1000, currency: "USD",
    description: "Conversión USD → ARS",
    metadata: { rate: 1340, received: 1340000, toCurrency: "ARS" },
    createdAt: "2026-05-11T11:00:00Z",
  },
  {
    id: "tx_016",
    type: "EXCHANGE", status: "COMPLETED", amount: 1000, currency: "USD",
    description: "Conversión USD → USDT (ahorro)",
    metadata: { rate: 1.0002, received: 1000.20, toCurrency: "USDT" },
    createdAt: "2026-05-12T12:00:00Z",
  },
  {
    id: "tx_017",
    type: "WITHDRAWAL", status: "COMPLETED", amount: 95000, currency: "ARS",
    description: "Retiro a CVU — Mercado Pago ···5523",
    category: "TRANSFER",
    createdAt: "2026-05-18T14:00:00Z",
  },
  {
    id: "tx_018",
    type: "WITHDRAWAL", status: "COMPLETED", amount: 45000, currency: "ARS",
    description: "Alquiler — junio 2026",
    category: "UTILITIES",
    createdAt: "2026-05-23T16:00:00Z",
  },

  // ── Mes 2 — hace ~60 días (abril 2026) ─────────────────────────────────────
  {
    id: "tx_007",
    type: "DEPOSIT", status: "COMPLETED", amount: 3500, currency: "USD",
    description: "TechForge Solutions · Invoice INV-2026-0009",
    createdAt: "2026-04-08T10:00:00Z",
  },
  {
    id: "tx_008",
    type: "EXCHANGE", status: "COMPLETED", amount: 1500, currency: "USD",
    description: "Conversión USD → ARS",
    metadata: { rate: 1325, received: 1987500, toCurrency: "ARS" },
    createdAt: "2026-04-09T11:00:00Z",
  },
  {
    id: "tx_009",
    type: "EXCHANGE", status: "COMPLETED", amount: 800, currency: "USD",
    description: "Conversión USD → USDT",
    metadata: { rate: 1.0002, received: 800.16, toCurrency: "USDT" },
    createdAt: "2026-04-10T12:00:00Z",
  },
  {
    id: "tx_010",
    type: "WITHDRAWAL", status: "COMPLETED", amount: 100000, currency: "ARS",
    description: "Retiro a CVU — Mercado Pago ···5523",
    category: "TRANSFER",
    createdAt: "2026-04-16T14:00:00Z",
  },
  {
    id: "tx_011",
    type: "WITHDRAWAL", status: "COMPLETED", amount: 45000, currency: "ARS",
    description: "Alquiler — mayo 2026",
    category: "UTILITIES",
    createdAt: "2026-04-22T16:00:00Z",
  },

  // ── Mes 1 — hace ~90 días (marzo 2026) ─────────────────────────────────────
  {
    id: "tx_001",
    type: "DEPOSIT", status: "COMPLETED", amount: 2000, currency: "USD",
    description: "Acme Creative Co. · Invoice INV-2026-0005",
    createdAt: "2026-03-09T10:00:00Z",
  },
  {
    id: "tx_002",
    type: "EXCHANGE", status: "COMPLETED", amount: 1000, currency: "USD",
    description: "Conversión USD → ARS",
    metadata: { rate: 1310, received: 1310000, toCurrency: "ARS" },
    createdAt: "2026-03-10T11:00:00Z",
  },
  {
    id: "tx_003",
    type: "EXCHANGE", status: "COMPLETED", amount: 400, currency: "USD",
    description: "Conversión USD → USDT",
    metadata: { rate: 1.0002, received: 400.08, toCurrency: "USDT" },
    createdAt: "2026-03-10T12:00:00Z",
  },
]

// ── Deposit history (depositar page) ─────────────────────────────────────────
// Matches the 3 income deposits in the seed + 1 pending SWIFT in flight.

export const mockDepositHistory: DepositEntry[] = [
  {
    id: "dep_pending_001",
    amount: 1400,
    currency: "USD",
    from: "Bright Creative Studio (UK)",
    reference: "INV-2026-0014",
    status: "pending",
    method: "SWIFT",
    estimatedArrival: "2026-06-10",
    createdAt: "2026-06-05T08:00:00Z",
  },
  {
    id: "dep_014",
    amount: 2800,
    currency: "USD",
    from: "Nova Digital (US)",
    reference: "INV-2026-0012",
    status: "completed",
    method: "ACH",
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "dep_007",
    amount: 3500,
    currency: "USD",
    from: "TechForge Solutions (EU)",
    reference: "INV-2026-0009",
    status: "completed",
    method: "SWIFT",
    createdAt: "2026-04-08T10:00:00Z",
  },
  {
    id: "dep_001",
    amount: 2000,
    currency: "USD",
    from: "Acme Creative Co. (US)",
    reference: "INV-2026-0005",
    status: "completed",
    method: "ACH",
    createdAt: "2026-03-09T10:00:00Z",
  },
]

// ── Withdrawal history (retirar page) ────────────────────────────────────────
// Shows all statuses: processing (USD pending from seed) · failed · completed.

export const mockWithdrawalHistory: WithdrawalEntry[] = [
  {
    id: "wd_processing",
    amount: 200,
    currency: "USD",
    destination: "Santander Argentina",
    destinationLast4: "8821",
    fee: 0.20,
    net: 199.80,
    status: "processing",
    createdAt: "2026-06-07T09:00:00Z",
  },
  {
    id: "wd_failed",
    amount: 1500,
    currency: "USD",
    destination: "Wise",
    destinationLast4: "9034",
    fee: 0,
    net: 0,
    status: "failed",
    failureReason: "Fondos insuficientes para el monto solicitado",
    createdAt: "2026-05-25T14:30:00Z",
  },
  {
    id: "wd_003",
    amount: 95000,
    currency: "ARS",
    destination: "Mercado Pago CVU",
    destinationLast4: "5523",
    fee: 0,
    net: 95000,
    status: "completed",
    createdAt: "2026-05-18T14:00:00Z",
  },
  {
    id: "wd_002",
    amount: 100000,
    currency: "ARS",
    destination: "Mercado Pago CVU",
    destinationLast4: "5523",
    fee: 0,
    net: 100000,
    status: "completed",
    createdAt: "2026-04-16T14:00:00Z",
  },
  {
    id: "wd_001",
    amount: 85000,
    currency: "ARS",
    destination: "Mercado Pago CVU",
    destinationLast4: "5523",
    fee: 0,
    net: 85000,
    status: "completed",
    createdAt: "2026-03-18T12:00:00Z",
  },
]

// ── Beneficiaries (no Beneficiary model in backend yet) ──────────────────────

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: "ben_001",
    label: "Santander Personal",
    name: "Emiliano Ferreyra",
    bankName: "Santander Argentina",
    accountNumber: "0072-0000-00-0000008821-5",
    accountLast4: "8821",
    currency: "ARS",
    country: "AR",
  },
  {
    id: "ben_002",
    label: "Mercado Pago CVU",
    name: "Emiliano Ferreyra",
    bankName: "Mercado Pago",
    accountNumber: "0000003-00-0000005523-8",
    accountLast4: "5523",
    currency: "ARS",
    country: "AR",
  },
  {
    id: "ben_003",
    label: "Wise USD",
    name: "Emiliano Ferreyra",
    bankName: "Wise",
    accountNumber: "BE89 9670 1234 5678",
    accountLast4: "9034",
    currency: "USD",
    country: "US",
  },
]

// ── Notifications ─────────────────────────────────────────────────────────────

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    type: "deposit",
    title: "Depósito recibido",
    body: "Recibiste USD 2.800 de Nova Digital · INV-2026-0012",
    read: false,
    createdAt: "2026-05-10T10:00:00Z",
    href: "/depositar",
  },
  {
    id: "n2",
    type: "yield",
    title: "Rendimiento acreditado",
    body: "Ganaste USD 0,18 de rendimiento diario en tu billetera USD",
    read: false,
    createdAt: "2026-06-07T00:05:00Z",
    href: "/wallet",
  },
  {
    id: "n3",
    type: "withdrawal",
    title: "Retiro en proceso",
    body: "Tu retiro de USD 200 a Santander ···8821 está siendo procesado",
    read: true,
    createdAt: "2026-06-07T09:00:00Z",
    href: "/retirar",
  },
  {
    id: "n4",
    type: "alert",
    title: "Retiro fallido",
    body: "Retiro de USD 1.500 a Wise rechazado — fondos insuficientes",
    read: false,
    createdAt: "2026-05-25T14:30:00Z",
    href: "/retirar",
  },
  {
    id: "n5",
    type: "deposit",
    title: "Depósito pendiente",
    body: "USD 1.400 de Bright Creative Studio en camino — SWIFT 3–5 días hábiles",
    read: true,
    createdAt: "2026-06-05T08:00:00Z",
    href: "/depositar",
  },
]

// ── Chat — soporte (mock conversation, no backend chat yet) ──────────────────

export const mockChatMessages: ChatMessage[] = [
  {
    id: "cm1",
    from: "support",
    senderName: "Valentina · PayFlow",
    text: "¡Hola Emiliano! Bienvenido a PayFlow. Soy Valentina del equipo de soporte. ¿En qué podemos ayudarte?",
    createdAt: "2026-03-09T10:15:00Z",
  },
  {
    id: "cm2",
    from: "user",
    senderName: "Emiliano",
    text: "Hola, acabo de recibir mi primer pago internacional de USD 2.000. ¿Cuándo se va a acreditar?",
    createdAt: "2026-03-09T10:18:00Z",
  },
  {
    id: "cm3",
    from: "support",
    senderName: "Valentina · PayFlow",
    text: "¡Felicitaciones por tu primer cobro! 🎉 Los pagos ACH desde EE.UU. se acreditan en 1–2 días hábiles. Ya veo la transferencia entrando en el sistema — deberías verla hoy antes de las 18hs.",
    createdAt: "2026-03-09T10:22:00Z",
  },
  {
    id: "cm4",
    from: "user",
    senderName: "Emiliano",
    text: "Gracias. Intenté retirar USD 1.500 a mi cuenta Wise pero me rechazó el retiro.",
    createdAt: "2026-05-25T15:00:00Z",
  },
  {
    id: "cm5",
    from: "support",
    senderName: "Valentina · PayFlow",
    text: "Revisé tu cuenta. El retiro fue rechazado porque el monto solicitado ($1.500) superaba tu saldo USD disponible en ese momento. Tu saldo actual es USD $1.842,50. Podés intentar con hasta USD $1.600 dejando margen para la comisión. ¿Te ayudo con algo más?",
    createdAt: "2026-05-25T15:08:00Z",
  },
]
