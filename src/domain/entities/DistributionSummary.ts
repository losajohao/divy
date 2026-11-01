import type { DistributionCategory } from './DistributionCategory'

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
  monthlySalary: number
  exchangeRate: number
  totalAvailable: number
  totalAllocated: number
  remainingBalance: number
  breakdownByCategory: CategoryBreakdown[]
}
