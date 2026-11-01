import type { AllocationItem, FinancialBase } from '@/domain/entities/AllocationItem'
import { Currency } from '@/domain/entities/Currency'
import { DistributionCategory } from '@/domain/entities/DistributionCategory'
import { IncomeSourceType } from '@/domain/entities/IncomeSource'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

const BASE_STORAGE_KEY = 'divy_financial_base_v4'
const ALLOCATIONS_STORAGE_KEY = 'divy_allocations_v3'

const DEFAULT_BASE: FinancialBase = {
  currentBalance: 850,
  exchangeRate: 3.75,
  incomes: [
    {
      id: 'inc-salary',
      type: IncomeSourceType.SALARY,
      amount: 4500,
    },
  ],
}

const DEFAULT_ALLOCATIONS: AllocationItem[] = [
  {
    id: 'seed-1',
    concept: 'Alquiler y mantenimiento',
    category: DistributionCategory.FIXED_EXPENSES,
    currency: Currency.PEN,
    amount: 1500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    concept: 'Fondo de ahorro mensual',
    category: DistributionCategory.SAVINGS,
    currency: Currency.PEN,
    amount: 700,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    concept: 'Facturación TC Soles (Mes facturado)',
    category: DistributionCategory.CREDIT_CARD_PAYMENT,
    currency: Currency.PEN,
    amount: 650,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    concept: 'Facturación TC Dólares (Mes facturado)',
    category: DistributionCategory.CREDIT_CARD_PAYMENT,
    currency: Currency.USD,
    amount: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-5',
    concept: 'Salidas y gastos personales',
    category: DistributionCategory.PERSONAL_EXPENSES,
    currency: Currency.PEN,
    amount: 400,
    createdAt: new Date().toISOString(),
  },
]

export class LocalStorageBudgetRepository implements IBudgetRepository {
  getFinancialBase(): FinancialBase {
    const raw = localStorage.getItem(BASE_STORAGE_KEY)
    if (!raw) {
      this.saveFinancialBase(DEFAULT_BASE)
      return { ...DEFAULT_BASE, incomes: [...DEFAULT_BASE.incomes] }
    }
    try {
      const parsed = JSON.parse(raw) as Partial<FinancialBase>
      return {
        currentBalance: Number(parsed.currentBalance ?? DEFAULT_BASE.currentBalance),
        exchangeRate: Number(parsed.exchangeRate ?? DEFAULT_BASE.exchangeRate),
        incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [...DEFAULT_BASE.incomes],
      }
    } catch {
      return { ...DEFAULT_BASE, incomes: [...DEFAULT_BASE.incomes] }
    }
  }

  saveFinancialBase(base: FinancialBase): void {
    localStorage.setItem(BASE_STORAGE_KEY, JSON.stringify(base))
  }

  getAllocations(): AllocationItem[] {
    const raw = localStorage.getItem(ALLOCATIONS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_ALLOCATIONS))
      return [...DEFAULT_ALLOCATIONS]
    }
    try {
      return JSON.parse(raw) as AllocationItem[]
    } catch {
      return [...DEFAULT_ALLOCATIONS]
    }
  }

  addAllocation(item: AllocationItem): void {
    const current = this.getAllocations()
    const updated = [item, ...current]
    localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(updated))
  }

  removeAllocation(id: string): void {
    const current = this.getAllocations()
    const updated = current.filter((item) => item.id !== id)
    localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(updated))
  }
}
