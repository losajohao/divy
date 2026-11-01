export enum Currency {
  PEN = 'PEN',
  USD = 'USD',
}

export interface CurrencyMetadata {
  code: Currency
  symbol: string
  label: string
}

export const CURRENCIES: Record<Currency, CurrencyMetadata> = {
  [Currency.PEN]: {
    code: Currency.PEN,
    symbol: 'S/',
    label: 'Soles (S/)',
  },
  [Currency.USD]: {
    code: Currency.USD,
    symbol: '$',
    label: 'Dólares ($)',
  },
}

export function formatMoney(amount: number, currency: Currency = Currency.PEN): string {
  const symbol = CURRENCIES[currency].symbol
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`
}

