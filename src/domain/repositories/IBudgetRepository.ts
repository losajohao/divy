import type { AllocationItem, FinancialBase } from '../entities/AllocationItem'

export interface IBudgetRepository {
  getFinancialBase(): FinancialBase
  saveFinancialBase(base: FinancialBase): void
  getAllocations(): AllocationItem[]
  addAllocation(item: AllocationItem): void
  removeAllocation(id: string): void
}

