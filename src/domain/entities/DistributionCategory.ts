export enum DistributionCategory {
  FIXED_EXPENSES = 'FIXED_EXPENSES',
  PERSONAL_EXPENSES = 'PERSONAL_EXPENSES',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD_PAYMENT = 'CREDIT_CARD_PAYMENT',
}

export interface CategoryMetadata {
  key: DistributionCategory
  label: string
  shortDescription: string
  accentColor: string
}

export const DISTRIBUTION_CATEGORIES: Record<DistributionCategory, CategoryMetadata> = {
  [DistributionCategory.FIXED_EXPENSES]: {
    key: DistributionCategory.FIXED_EXPENSES,
    label: 'Gastos Fijos',
    shortDescription: 'Alquiler, servicios, suscripciones del mes',
    accentColor: '#3b82f6',
  },
  [DistributionCategory.PERSONAL_EXPENSES]: {
    key: DistributionCategory.PERSONAL_EXPENSES,
    label: 'Gastos Personales',
    shortDescription: 'Ocio, salidas, compras cotidianas',
    accentColor: '#8b5cf6',
  },
  [DistributionCategory.SAVINGS]: {
    key: DistributionCategory.SAVINGS,
    label: 'Ahorro',
    shortDescription: 'Fondo de emergencia, inversiones y metas',
    accentColor: '#10b981',
  },
  [DistributionCategory.CREDIT_CARD_PAYMENT]: {
    key: DistributionCategory.CREDIT_CARD_PAYMENT,
    label: 'Pagos de TC',
    shortDescription: 'Pago del mes facturado de tarjeta en Soles (S/) y Dólares ($)',
    accentColor: '#f59e0b',
  },
}
