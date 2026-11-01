<script setup lang="ts">
import { computed } from 'vue'
import type { AllocationItem } from '@/domain/entities/AllocationItem'
import { Currency, formatMoney } from '@/domain/entities/Currency'
import { DISTRIBUTION_CATEGORIES } from '@/domain/entities/DistributionCategory'
import type { DistributionSummary } from '@/domain/entities/DistributionSummary'
import { INCOME_SOURCES } from '@/domain/entities/IncomeSource'
import type { GridFilterType } from '@/presentation/composables/useBudgetDistribution'

const props = defineProps<{
  summary: DistributionSummary
  items: AllocationItem[]
  activeCategory: GridFilterType
}>()

const emit = defineEmits<{
  removeAllocation: [id: string]
  removeIncome: [id: string]
  selectCategory: [category: GridFilterType]
  exportExcel: []
}>()

const getEquivalentPen = (item: AllocationItem): number => {
  return item.currency === Currency.USD ? item.amount * props.summary.exchangeRate : item.amount
}

const getPercentageOfTotal = (amountPen: number) => {
  if (props.summary.totalAvailable <= 0) return '0.0%'
  return `${((amountPen / props.summary.totalAvailable) * 100).toFixed(1)}%`
}

const showIncomes = computed(
  () => props.activeCategory === 'INCOMES' || props.activeCategory === 'ALL',
)

const showAllocations = computed(() => props.activeCategory !== 'INCOMES')

const visibleAllocationTotalPen = computed(() =>
  props.items.reduce((sum, item) => sum + getEquivalentPen(item), 0),
)

const totalAllocationCount = computed(() =>
  props.summary.breakdownByCategory.reduce((sum, cat) => sum + cat.itemCount, 0),
)

const totalAllCount = computed(() => totalAllocationCount.value + props.summary.incomes.length)

const toggleCategory = (category: GridFilterType) => {
  if (props.activeCategory === category) {
    emit('selectCategory', 'ALL')
  } else {
    emit('selectCategory', category)
  }
}
</script>

<template>
  <section class="grid-panel">
    <div class="table-card">
      <!-- Cabecera 100% responsiva: título, filtros y botón Exportar Excel -->
      <div class="table-top-bar">
        <div class="title-and-export-mobile">
          <h2>Grilla de Distribución</h2>
        </div>

        <div class="top-actions">
          <div class="filter-bar" role="tablist" aria-label="Filtrar por categoría">
            <button
              type="button"
              class="filter-btn"
              :class="{ active: activeCategory === 'ALL' }"
              @click="emit('selectCategory', 'ALL')"
            >
              Todas
              <span class="filter-count">{{ totalAllCount }}</span>
            </button>

            <button
              type="button"
              class="filter-btn"
              :class="{ active: activeCategory === 'INCOMES' }"
              style="--cat-color: #059669"
              @click="toggleCategory('INCOMES')"
            >
              <span class="filter-dot" style="background-color: #059669"></span>
              Ingresos
              <span class="filter-count">{{ summary.incomes.length }}</span>
            </button>

            <button
              v-for="cat in summary.breakdownByCategory"
              :key="cat.category"
              type="button"
              class="filter-btn"
              :class="{ active: activeCategory === cat.category }"
              :style="{ '--cat-color': DISTRIBUTION_CATEGORIES[cat.category].accentColor }"
              @click="toggleCategory(cat.category)"
            >
              <span
                class="filter-dot"
                :style="{ backgroundColor: DISTRIBUTION_CATEGORIES[cat.category].accentColor }"
              ></span>
              {{ cat.label }}
              <span class="filter-count">{{ cat.itemCount }}</span>
            </button>
          </div>

          <span class="actions-divider" aria-hidden="true"></span>

          <button
            type="button"
            class="export-excel-btn"
            title="Exportar la vista actual a Excel"
            @click="emit('exportExcel')"
          >
            ⬇ Exportar Excel
          </button>
        </div>
      </div>

      <!-- Tabla principal -->
      <div class="table-responsive">
        <table class="distribution-table">
          <thead>
            <tr>
              <th>Concepto / Partida</th>
              <th>Categoría</th>
              <th class="text-right">Monto Original</th>
              <th class="text-right">En Soles (S/)</th>
              <th class="text-right">% Disponible</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <!-- Filas de Ingresos -->
            <template v-if="showIncomes">
              <tr
                v-for="income in summary.incomes"
                :key="`inc-${income.id}`"
                class="income-row"
              >
                <td class="concept-cell">{{ INCOME_SOURCES[income.type].label }}</td>
                <td>
                  <span class="category-pill income-category-pill">
                    <span class="pill-dot" style="background-color: #059669"></span>
                    Ingreso
                  </span>
                </td>
                <td class="text-right amount-cell">
                  <span class="income-amount-badge">
                    + {{ formatMoney(income.amount, Currency.PEN) }}
                  </span>
                </td>
                <td class="text-right equiv-cell">
                  {{ formatMoney(income.amount, Currency.PEN) }}
                </td>
                <td class="text-right percent-cell">
                  {{ getPercentageOfTotal(income.amount) }}
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="delete-btn"
                    title="Eliminar ingreso"
                    @click="emit('removeIncome', income.id)"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            </template>

            <!-- Filas de Partidas de Distribución -->
            <template v-if="showAllocations">
              <tr v-for="item in items" :key="item.id">
                <td class="concept-cell">{{ item.concept }}</td>
                <td>
                  <span
                    class="category-pill"
                    :style="{
                      borderColor: DISTRIBUTION_CATEGORIES[item.category].accentColor,
                      color: DISTRIBUTION_CATEGORIES[item.category].accentColor,
                    }"
                  >
                    <span
                      class="pill-dot"
                      :style="{
                        backgroundColor: DISTRIBUTION_CATEGORIES[item.category].accentColor,
                      }"
                    ></span>
                    {{ DISTRIBUTION_CATEGORIES[item.category].label }}
                  </span>
                </td>
                <td class="text-right amount-cell">
                  <span :class="item.currency === Currency.USD ? 'usd-badge' : 'pen-badge'">
                    {{ formatMoney(item.amount, item.currency) }}
                  </span>
                </td>
                <td class="text-right equiv-cell">
                  {{ formatMoney(getEquivalentPen(item), Currency.PEN) }}
                </td>
                <td class="text-right percent-cell">
                  {{ getPercentageOfTotal(getEquivalentPen(item)) }}
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="delete-btn"
                    title="Eliminar partida"
                    @click="emit('removeAllocation', item.id)"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            </template>

            <tr
              v-if="
                (activeCategory === 'INCOMES' && summary.incomes.length === 0) ||
                (activeCategory !== 'INCOMES' &&
                  items.length === 0 &&
                  (activeCategory !== 'ALL' || summary.incomes.length === 0))
              "
            >
              <td colspan="6" class="empty-row">
                No hay registros en esta categoría.
              </td>
            </tr>
          </tbody>

          <tfoot v-if="activeCategory === 'INCOMES' && summary.incomes.length > 0">
            <tr class="summary-footer-row">
              <td colspan="3">
                <strong>Total Fuentes de Ingreso ({{ summary.incomes.length }})</strong>
              </td>
              <td class="text-right">
                <strong>{{ formatMoney(summary.totalIncomes, Currency.PEN) }}</strong>
              </td>
              <td class="text-right">
                <strong>{{ getPercentageOfTotal(summary.totalIncomes) }}</strong>
              </td>
              <td></td>
            </tr>
          </tfoot>

          <tfoot v-else-if="items.length > 0">
            <tr class="summary-footer-row">
              <td colspan="3">
                <strong>Subtotal Distribuido ({{ items.length }} partidas)</strong>
              </td>
              <td class="text-right">
                <strong>{{ formatMoney(visibleAllocationTotalPen, Currency.PEN) }}</strong>
              </td>
              <td class="text-right">
                <strong>{{ getPercentageOfTotal(visibleAllocationTotalPen) }}</strong>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.table-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.table-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.title-and-export-mobile h2 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  min-width: 0;
}

.filter-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  padding: 0.22rem;
  border-radius: 0.5rem;
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  max-width: 100%;
}

.actions-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border-subtle);
  margin: 0 0.1rem;
  flex-shrink: 0;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  border-radius: 0.4rem;
  border: 1px solid var(--border-subtle);
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  color: var(--text-primary);
  border-color: var(--cat-color, #2563eb);
}

.filter-btn.active {
  background: color-mix(in srgb, var(--cat-color, #2563eb) 14%, var(--surface-card));
  border-color: var(--cat-color, #2563eb);
  color: var(--text-primary);
}

.filter-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.filter-count {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.05rem 0.32rem;
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-secondary);
}

.export-excel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.38rem 0.85rem;
  border-radius: 0.45rem;
  border: 1px solid #059669;
  background: #059669;
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(5, 150, 105, 0.25);
  flex-shrink: 0;
}

.export-excel-btn:hover {
  background: #047857;
  border-color: #047857;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border-subtle);
  border-radius: 0.55rem;
}

.distribution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.distribution-table th,
.distribution-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  text-align: left;
}

.distribution-table thead th {
  background: var(--surface-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  font-weight: 700;
  white-space: nowrap;
}

.distribution-table tbody tr:hover {
  background: var(--surface-muted);
}

.distribution-table tbody tr:last-child td {
  border-bottom: none;
}

.summary-footer-row td {
  background: var(--surface-muted);
  border-top: 2px solid var(--border-subtle);
  border-bottom: none;
  font-size: 0.84rem;
  color: var(--text-primary);
}

.text-right {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.concept-cell {
  font-weight: 600;
  color: var(--text-primary);
}

.amount-cell {
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.usd-badge {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
}

.income-amount-badge {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
}

.equiv-cell {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.percent-cell {
  color: var(--text-secondary);
  font-weight: 600;
  white-space: nowrap;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
}

.income-category-pill {
  border-color: #059669;
  color: #059669;
}

.pill-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
}

.delete-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 0.35rem;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.18);
}

.empty-row {
  text-align: center !important;
  padding: 2rem !important;
  color: var(--text-secondary);
}

/* Ajustes responsivos para tablets y móviles */
@media (max-width: 768px) {
  .table-card {
    padding: 0.85rem;
  }

  .top-actions {
    width: 100%;
    justify-content: space-between;
  }

  .actions-divider {
    display: none;
  }

  .filter-bar {
    flex: 1;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .export-excel-btn {
    width: 100%;
  }

  .distribution-table th,
  .distribution-table td {
    padding: 0.6rem 0.65rem;
    font-size: 0.8rem;
  }
}
</style>
