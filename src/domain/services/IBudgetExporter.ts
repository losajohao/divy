import type { AllocationItem } from '../entities/AllocationItem'
import type { DistributionSummary } from '../entities/DistributionSummary'
import type { IncomeEntry } from '../entities/IncomeSource'

export interface ExportBudgetPayload {
  summary: DistributionSummary
  incomes: IncomeEntry[]
  items: AllocationItem[]
  filterName: string
}

export interface IBudgetExporter {
  export(payload: ExportBudgetPayload): void
}

