import type { FinancialBase } from '@/domain/entities/AllocationItem'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

export class UpdateFinancialBaseUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  execute(base: FinancialBase): void {
    const sanitizedBase: FinancialBase = {
      currentBalance: Math.max(0, Number(base.currentBalance) || 0),
      monthlySalary: Math.max(0, Number(base.monthlySalary) || 0),
      exchangeRate: Math.max(0.01, Number(base.exchangeRate) || 3.75),
    }
    this.repository.saveFinancialBase(sanitizedBase)
  }
}
