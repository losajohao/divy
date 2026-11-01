import type { Currency } from './Currency'
import type { DistributionCategory } from './DistributionCategory'

export interface FinancialBase {
  currentBalance: number
  monthlySalary: number
  exchangeRate: number
}

export interface AllocationItem {
  id: string
  concept: string
  category: DistributionCategory
  currency: Currency
  amount: number
  createdAt: string
}
