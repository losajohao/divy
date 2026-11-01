import type { Currency } from './Currency'
import type { DistributionCategory } from './DistributionCategory'
import type { IncomeEntry } from './IncomeSource'

export interface FinancialBase {
  currentBalance: number
  exchangeRate: number
  incomes: IncomeEntry[]
}

export interface AllocationItem {
  id: string
  concept: string
  category: DistributionCategory
  currency: Currency
  amount: number
  createdAt: string
}
