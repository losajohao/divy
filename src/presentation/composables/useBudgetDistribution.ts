import { computed, ref } from 'vue'
import {
  AddAllocationItemUseCase,
  type CreateAllocationInput,
} from '@/application/use-cases/AddAllocationItemUseCase'
import { GetDistributionSummaryUseCase } from '@/application/use-cases/GetDistributionSummaryUseCase'
import { RemoveAllocationItemUseCase } from '@/application/use-cases/RemoveAllocationItemUseCase'
import { UpdateFinancialBaseUseCase } from '@/application/use-cases/UpdateFinancialBaseUseCase'
import type { AllocationItem, FinancialBase } from '@/domain/entities/AllocationItem'
import type { DistributionCategory } from '@/domain/entities/DistributionCategory'
import type { DistributionSummary } from '@/domain/entities/DistributionSummary'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import {
  DistributionCalculator,
  type IDistributionCalculator,
} from '@/domain/services/DistributionCalculator'
import { LocalStorageBudgetRepository } from '@/infrastructure/repositories/LocalStorageBudgetRepository'

export function useBudgetDistribution(
  repository: IBudgetRepository = new LocalStorageBudgetRepository(),
  calculator: IDistributionCalculator = new DistributionCalculator(),
) {
  const getSummaryUseCase = new GetDistributionSummaryUseCase(repository, calculator)
  const updateBaseUseCase = new UpdateFinancialBaseUseCase(repository)
  const addAllocationUseCase = new AddAllocationItemUseCase(repository)
  const removeAllocationUseCase = new RemoveAllocationItemUseCase(repository)

  const initialSnapshot = getSummaryUseCase.execute()

  const summary = ref<DistributionSummary>(initialSnapshot.summary)
  const items = ref<AllocationItem[]>(initialSnapshot.items)
  const activeCategoryFilter = ref<DistributionCategory | 'ALL'>('ALL')
  const errorMessage = ref<string | null>(null)

  const refreshState = () => {
    const snapshot = getSummaryUseCase.execute()
    summary.value = snapshot.summary
    items.value = snapshot.items
  }

  const updateFinancialBase = (base: FinancialBase) => {
    errorMessage.value = null
    updateBaseUseCase.execute(base)
    refreshState()
  }

  const addAllocation = (input: CreateAllocationInput): boolean => {
    try {
      errorMessage.value = null
      addAllocationUseCase.execute(input)
      refreshState()
      return true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Error al registrar asignación'
      return false
    }
  }

  const removeAllocation = (id: string) => {
    errorMessage.value = null
    removeAllocationUseCase.execute(id)
    refreshState()
  }

  const filteredItems = computed(() => {
    if (activeCategoryFilter.value === 'ALL') {
      return items.value
    }
    return items.value.filter((item) => item.category === activeCategoryFilter.value)
  })

  return {
    summary,
    items,
    filteredItems,
    activeCategoryFilter,
    errorMessage,
    updateFinancialBase,
    addAllocation,
    removeAllocation,
  }
}

