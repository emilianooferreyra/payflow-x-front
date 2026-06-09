export interface BankingDetail {
  label: string
  value: string
  copyable: boolean
}

export interface BankingInstructions {
  currency: string
  flag: string
  fields: BankingDetail[]
  note: string
}

export const bankingInstructions: BankingInstructions[] = [
  {
    currency: "USD",
    flag: "🇺🇸",
    fields: [
      { label: "Beneficiary name", value: "PayFlow Financial Services LLC", copyable: true },
      { label: "Account number", value: "8847392001", copyable: true },
      { label: "ACH routing number", value: "026073150", copyable: true },
      { label: "Wire routing number", value: "026073150", copyable: true },
      { label: "Bank name", value: "Community Federal Savings Bank", copyable: false },
      { label: "Bank address", value: "89-16 Jamaica Ave, Woodhaven, NY 11421", copyable: false },
    ],
    note: "Use your email as the payment reference. Domestic wires typically arrive within 1 business day.",
  },
  {
    currency: "SWIFT / International",
    flag: "🌍",
    fields: [
      { label: "Beneficiary name", value: "PayFlow Financial Services LLC", copyable: true },
      { label: "Account number", value: "8847392001", copyable: true },
      { label: "SWIFT / BIC code", value: "CFSBUS33XXX", copyable: true },
      { label: "Bank name", value: "Community Federal Savings Bank", copyable: false },
      { label: "Bank address", value: "89-16 Jamaica Ave, Woodhaven, NY 11421", copyable: false },
    ],
    note: "International SWIFT transfers may take 2–5 business days. Intermediary bank fees may apply.",
  },
]

export interface SavedAccount {
  id: string
  label: string
  bankName: string
  accountLast4: string
  currency: string
  country: string
}

export const savedAccounts: SavedAccount[] = [
  { id: "ben_001", label: "Santander Personal", bankName: "Santander Argentina", accountLast4: "8821", currency: "ARS", country: "AR" },
  { id: "ben_002", label: "Mercado Pago CVU",   bankName: "Mercado Pago",        accountLast4: "5523", currency: "ARS", country: "AR" },
  { id: "ben_003", label: "Wise USD",            bankName: "Wise",                accountLast4: "9034", currency: "USD", country: "US" },
]
