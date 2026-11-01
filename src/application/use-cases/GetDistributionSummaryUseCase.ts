import type { AllocationItem } from '@/domain/entities/AllocationItem'
import type { DistributionSummary } from '@/domain/entities/DistributionSummary'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import type { IDistributionCalculator } from '@/domain/services/DistributionCalculator'

export interface DistributionStateSnapshot {
  summary: DistributionSummary
  items: AllocationItem[]
}

export class GetDistributionSummaryUseCase {
  constructor(
    private readonly repository: IBudgetRepository,
    private readonly calculator: IDistributionCalculator,
  ) {}

  execute(): DistributionStateSnapshot {
    const base = this.repository.getFinancialBase()
    const items = this.repository.getAllocations()
    const summary = this.calculator.calculate(base, items)

    return {
      summary,
      items,
    }
  }
}

