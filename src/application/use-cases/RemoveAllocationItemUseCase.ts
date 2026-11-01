import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

export class RemoveAllocationItemUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  execute(id: string): void {
    if (!id) return
    this.repository.removeAllocation(id)
  }
}

