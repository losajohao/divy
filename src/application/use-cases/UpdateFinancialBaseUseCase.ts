import type { FinancialBase } from '@/domain/entities/AllocationItem'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

export class UpdateFinancialBaseUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  execute(base: FinancialBase): void {
    const sanitizedBase: FinancialBase = {
      currentBalance: Math.max(0, Number(base.currentBalance) || 0),
      exchangeRate: Math.max(0.01, Number(base.exchangeRate) || 3.75),
      incomes: Array.isArray(base.incomes)
        ? base.incomes
            .filter((item) => Number(item.amount) > 0)
            .map((item) => ({
              id: item.id || crypto.randomUUID(),
              type: item.type,
              amount: Math.max(0, Number(item.amount) || 0),
            }))
        : [],
    }
    this.repository.saveFinancialBase(sanitizedBase)
  }
}
