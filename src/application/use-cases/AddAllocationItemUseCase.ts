import type { AllocationItem } from '@/domain/entities/AllocationItem'
import { Currency } from '@/domain/entities/Currency'
import type { DistributionCategory } from '@/domain/entities/DistributionCategory'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

export interface CreateAllocationInput {
  concept: string
  category: DistributionCategory
  currency: Currency
  amount: number
}

export class AddAllocationItemUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  execute(input: CreateAllocationInput): AllocationItem {
    const trimmedConcept = input.concept.trim()
    if (!trimmedConcept) {
      throw new Error('El concepto es obligatorio.')
    }
    if (input.amount <= 0 || Number.isNaN(input.amount)) {
      throw new Error('El monto debe ser mayor a 0.')
    }

    const newItem: AllocationItem = {
      id: crypto.randomUUID(),
      concept: trimmedConcept,
      category: input.category,
      currency: input.currency ?? Currency.PEN,
      amount: Number(input.amount),
      createdAt: new Date().toISOString(),
    }

    this.repository.addAllocation(newItem)
    return newItem
  }
}
