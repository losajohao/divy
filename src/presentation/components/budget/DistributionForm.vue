<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CreateAllocationInput } from '@/application/use-cases/AddAllocationItemUseCase'
import type { FinancialBase } from '@/domain/entities/AllocationItem'
import { CURRENCIES, Currency, formatMoney } from '@/domain/entities/Currency'
import {
  DISTRIBUTION_CATEGORIES,
  DistributionCategory,
} from '@/domain/entities/DistributionCategory'
import {
  INCOME_SOURCES,
  type IncomeEntry,
  IncomeSourceType,
} from '@/domain/entities/IncomeSource'

const props = defineProps<{
  currentBalance: number
  exchangeRate: number
  incomes: IncomeEntry[]
  errorMessage: string | null
}>()

const emit = defineEmits<{
  updateBase: [base: FinancialBase]
  addAllocation: [input: CreateAllocationInput]
}>()

const baseForm = reactive({
  currentBalance: props.currentBalance,
  exchangeRate: props.exchangeRate,
})

watch(
  () => [props.currentBalance, props.exchangeRate],
  ([newBalance, newRate]) => {
    baseForm.currentBalance = newBalance ?? 0
    baseForm.exchangeRate = newRate ?? 3.75
  },
)

const newIncomeForm = reactive({
  type: IncomeSourceType.SALARY,
  amount: 0,
})

const allocationForm = reactive<CreateAllocationInput>({
  concept: '',
  category: DistributionCategory.FIXED_EXPENSES,
  currency: Currency.PEN,
  amount: 0,
})

const incomeSourceOptions = Object.values(INCOME_SOURCES)
const categoryOptions = Object.values(DISTRIBUTION_CATEGORIES)
const currencyOptions = Object.values(CURRENCIES)

const convertedPreviewPen = computed(() => {
  if (allocationForm.currency !== Currency.USD || !allocationForm.amount) return null
  const rate = Number(baseForm.exchangeRate) || 3.75
  return formatMoney(Number(allocationForm.amount) * rate, Currency.PEN)
})

const emitBaseUpdate = (updatedIncomes: IncomeEntry[] = props.incomes) => {
  emit('updateBase', {
    currentBalance: Number(baseForm.currentBalance) || 0,
    exchangeRate: Number(baseForm.exchangeRate) || 3.75,
    incomes: updatedIncomes,
  })
}

const handleAddIncome = () => {
  const amount = Number(newIncomeForm.amount)
  if (!amount || amount <= 0) return

  const updated = [
    ...props.incomes,
    {
      id: crypto.randomUUID(),
      type: newIncomeForm.type,
      amount,
    },
  ]

  newIncomeForm.amount = 0
  emitBaseUpdate(updated)
}

const handleAllocationSubmit = () => {
  emit('addAllocation', {
    concept: allocationForm.concept,
    category: allocationForm.category,
    currency: allocationForm.currency,
    amount: Number(allocationForm.amount),
  })

  if (allocationForm.concept.trim() && allocationForm.amount > 0) {
    allocationForm.concept = ''
    allocationForm.amount = 0
  }
}
</script>

<template>
  <aside class="form-panel">
    <!-- Paso 1: Bolsa disponible del mes (sin chips que ocupen espacio) -->
    <div class="panel-section">
      <div class="section-header">
        <span class="step-tag">1</span>
        <h3>Bolsa del Mes a Distribuir</h3>
      </div>

      <div class="base-grid-2">
        <div class="field">
          <label for="current-balance">Saldo Actual (S/)</label>
          <input
            id="current-balance"
            v-model.number="baseForm.currentBalance"
            type="number"
            min="0"
            step="0.01"
            @change="emitBaseUpdate()"
          />
        </div>

        <div class="field">
          <label for="exchange-rate">TC ($ → S/)</label>
          <input
            id="exchange-rate"
            v-model.number="baseForm.exchangeRate"
            type="number"
            min="0.01"
            step="0.01"
            @change="emitBaseUpdate()"
          />
        </div>
      </div>

      <form class="income-adder" @submit.prevent="handleAddIncome">
        <div class="field">
          <label for="income-source-type">Sumar Fuente al Mes</label>
          <div class="income-inline-row">
            <select id="income-source-type" v-model="newIncomeForm.type">
              <option v-for="src in incomeSourceOptions" :key="src.key" :value="src.key">
                {{ src.label }}
              </option>
            </select>
            <input
              v-model.number="newIncomeForm.amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="S/ Monto"
              aria-label="Monto de la fuente de ingreso en Soles"
            />
            <button type="submit" class="add-mini-btn" title="Sumar a la bolsa del mes">+</button>
          </div>
        </div>
      </form>
    </div>

    <hr class="section-divider" />

    <!-- Paso 2: Registro rápido de partida de distribución -->
    <div class="panel-section">
      <div class="section-header">
        <span class="step-tag">2</span>
        <h3>Distribuir en Categoría</h3>
      </div>

      <form class="allocation-stack" @submit.prevent="handleAllocationSubmit">
        <div class="field">
          <label for="allocation-category">Categoría</label>
          <select id="allocation-category" v-model="allocationForm.category">
            <option v-for="option in categoryOptions" :key="option.key" :value="option.key">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="allocation-concept">Concepto</label>
          <input
            id="allocation-concept"
            v-model="allocationForm.concept"
            type="text"
            placeholder="Ej. Alquiler, TC Soles, TC Dólares..."
            required
          />
        </div>

        <div class="amount-currency-row">
          <div class="field">
            <label>Moneda</label>
            <div class="currency-toggle" role="group" aria-label="Seleccionar moneda">
              <button
                v-for="curr in currencyOptions"
                :key="curr.code"
                type="button"
                class="currency-btn"
                :class="{ active: allocationForm.currency === curr.code }"
                @click="allocationForm.currency = curr.code"
              >
                {{ curr.symbol }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="allocation-amount">
              Monto ({{ CURRENCIES[allocationForm.currency].symbol }})
            </label>
            <input
              id="allocation-amount"
              v-model.number="allocationForm.amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <span v-if="convertedPreviewPen" class="conversion-hint">
          Equivale a <strong>{{ convertedPreviewPen }}</strong> (TC S/
          {{ baseForm.exchangeRate.toFixed(2) }})
        </span>

        <p v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </p>

        <button type="submit" class="primary-btn">+ Agregar Partida</button>
      </form>
    </div>
  </aside>
</template>

<style scoped>
.form-panel {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.step-tag {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.14);
  color: #2563eb;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.section-header h3 {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-divider {
  border: none;
  border-top: 1px solid var(--border-subtle);
  margin: 0.05rem 0;
}

.base-grid-2 {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 0.45rem;
}

.income-adder {
  display: flex;
  flex-direction: column;
}

.income-inline-row {
  display: grid;
  grid-template-columns: 1.15fr 1fr 2.15rem;
  gap: 0.35rem;
  align-items: center;
}

.add-mini-btn {
  height: 2.15rem;
  border-radius: 0.42rem;
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.add-mini-btn:hover {
  background: rgba(16, 185, 129, 0.22);
}

.allocation-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.amount-currency-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 0.5rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.field label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field input,
.field select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 2.15rem;
  padding: 0 0.5rem;
  border-radius: 0.42rem;
  border: 1px solid var(--border-subtle);
  background: var(--surface-muted);
  color: var(--text-primary);
  font-size: 0.8rem;
}

.field input:focus,
.field select:focus {
  outline: 2px solid #2563eb;
  border-color: transparent;
}

.currency-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 2.15rem;
  border-radius: 0.42rem;
  border: 1px solid var(--border-subtle);
  background: var(--surface-muted);
  overflow: hidden;
}

.currency-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}

.currency-btn.active {
  background: #2563eb;
  color: #ffffff;
}

.conversion-hint {
  font-size: 0.72rem;
  color: #2563eb;
}

.error-banner {
  font-size: 0.74rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.35rem 0.55rem;
  border-radius: 0.35rem;
}

.primary-btn {
  width: 100%;
  height: 2.25rem;
  border-radius: 0.45rem;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s ease;
  margin-top: 0.1rem;
}

.primary-btn:hover {
  background: #1d4ed8;
}
</style>
