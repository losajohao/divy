export enum IncomeSourceType {
  SALARY = 'SALARY',
  DEBT_COLLECTION = 'DEBT_COLLECTION',
  DEPOSIT = 'DEPOSIT',
  BONUS = 'BONUS',
}

export interface IncomeSourceMetadata {
  key: IncomeSourceType
  label: string
}

export const INCOME_SOURCES: Record<IncomeSourceType, IncomeSourceMetadata> = {
  [IncomeSourceType.SALARY]: {
    key: IncomeSourceType.SALARY,
    label: 'Salario',
  },
  [IncomeSourceType.DEBT_COLLECTION]: {
    key: IncomeSourceType.DEBT_COLLECTION,
    label: 'Cobro de Deuda',
  },
  [IncomeSourceType.DEPOSIT]: {
    key: IncomeSourceType.DEPOSIT,
    label: 'Depósito',
  },
  [IncomeSourceType.BONUS]: {
    key: IncomeSourceType.BONUS,
    label: 'Bono',
  },
}

export interface IncomeEntry {
  id: string
  type: IncomeSourceType
  amount: number
}

