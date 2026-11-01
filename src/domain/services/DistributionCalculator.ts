import type { AllocationItem, FinancialBase } from '../entities/AllocationItem'
import { Currency } from '../entities/Currency'
import { DISTRIBUTION_CATEGORIES, DistributionCategory } from '../entities/DistributionCategory'
import type { CategoryBreakdown, DistributionSummary } from '../entities/DistributionSummary'

export interface IDistributionCalculator {
  calculate(base: FinancialBase, items: AllocationItem[]): DistributionSummary
  toPen(amount: number, currency: Currency, exchangeRate: number): number
}

export class DistributionCalculator implements IDistributionCalculator {
  toPen(amount: number, currency: Currency, exchangeRate: number): number {
    const safeRate = exchangeRate > 0 ? exchangeRate : 1
    return currency === Currency.USD ? amount * safeRate : amount
  }

  calculate(base: FinancialBase, items: AllocationItem[]): DistributionSummary {
    const currentBalance = Math.max(0, Number(base.currentBalance) || 0)
    const exchangeRate = Math.max(0.01, Number(base.exchangeRate) || 3.75)
    const incomes = Array.isArray(base.incomes) ? base.incomes : []
    const totalIncomes = incomes.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)
    const totalAvailable = currentBalance + totalIncomes

    const categories = Object.values(DistributionCategory)

    const breakdownByCategory: CategoryBreakdown[] = categories.map((category) => {
      const metadata = DISTRIBUTION_CATEGORIES[category]
      const categoryItems = items.filter((item) => item.category === category)

      const amountPen = categoryItems
        .filter((item) => item.currency === Currency.PEN)
        .reduce((sum, item) => sum + item.amount, 0)

      const amountUsd = categoryItems
        .filter((item) => item.currency === Currency.USD)
        .reduce((sum, item) => sum + item.amount, 0)

      const totalConvertedPen = amountPen + this.toPen(amountUsd, Currency.USD, exchangeRate)

      const percentageOfAvailable =
        totalAvailable > 0 ? Math.round((totalConvertedPen / totalAvailable) * 1000) / 10 : 0

      return {
        category,
        label: metadata.label,
        amountPen,
        amountUsd,
        totalConvertedPen,
        percentageOfAvailable,
        itemCount: categoryItems.length,
      }
    })

    const totalAllocated = breakdownByCategory.reduce(
      (sum, item) => sum + item.totalConvertedPen,
      0,
    )

    const remainingBalance = totalAvailable - totalAllocated

    return {
      currentBalance,
      totalIncomes,
      incomes,
      exchangeRate,
      totalAvailable,
      totalAllocated,
      remainingBalance,
      breakdownByCategory,
    }
  }
}
