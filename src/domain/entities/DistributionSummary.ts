import type { DistributionCategory } from './DistributionCategory'
import type { IncomeEntry } from './IncomeSource'

export interface CategoryBreakdown {
  category: DistributionCategory
  label: string
  amountPen: number
  amountUsd: number
  totalConvertedPen: number
  percentageOfAvailable: number
  itemCount: number
}

export interface DistributionSummary {
  currentBalance: number
  totalIncomes: number
  incomes: IncomeEntry[]
  exchangeRate: number
  totalAvailable: number
  totalAllocated: number
  remainingBalance: number
  breakdownByCategory: CategoryBreakdown[]
}
