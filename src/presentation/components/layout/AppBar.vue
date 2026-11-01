<script setup lang="ts">
import logoUrl from '@/assets/logo.svg'
import { Currency, formatMoney } from '@/domain/entities/Currency'
import type { DistributionSummary } from '@/domain/entities/DistributionSummary'

defineProps<{
  summary: DistributionSummary
}>()
</script>

<template>
  <header class="app-bar">
    <div class="brand">
      <img :src="logoUrl" alt="Logo de Divy (Panda-Conejo)" class="brand-logo" width="40" height="40" />
      <div>
        <h1 class="brand-title">Divy</h1>
        <p class="brand-subtitle">
          Distribución Bimoneda (S/ y $) · TC S/ {{ summary.exchangeRate.toFixed(2) }}
        </p>
      </div>
    </div>

    <div class="metrics-bar">
      <div class="metric-item">
        <span class="metric-label">Bolsa Disponible (S/)</span>
        <div class="metric-compose">
          <strong class="metric-value">
            {{ formatMoney(summary.totalAvailable, Currency.PEN) }}
          </strong>
          <span class="metric-breakdown">
            ({{ formatMoney(summary.currentBalance, Currency.PEN) }} saldo +
            {{ formatMoney(summary.totalIncomes, Currency.PEN) }} ingresos)
          </span>
        </div>
      </div>

      <div class="metric-divider" aria-hidden="true"></div>

      <div class="metric-item">
        <span class="metric-label">Total Distribuido (S/)</span>
        <strong class="metric-value">
          {{ formatMoney(summary.totalAllocated, Currency.PEN) }}
        </strong>
      </div>

      <div
        class="metric-pill"
        :class="summary.remainingBalance < 0 ? 'status-danger' : 'status-success'"
      >
        <span class="metric-label">
          {{ summary.remainingBalance < 0 ? 'Excedido' : 'Saldo por Distribuir (S/)' }}
        </span>
        <strong class="metric-value">
          {{ formatMoney(summary.remainingBalance, Currency.PEN) }}
        </strong>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 30;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.6rem;
  flex-shrink: 0;
  display: block;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.15;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.metrics-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-compose {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.metric-breakdown {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.metric-divider {
  width: 1px;
  height: 1.75rem;
  background: var(--border-subtle);
}

.metric-pill {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.85rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-subtle);
}

.metric-pill.status-success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.35);
}

.metric-pill.status-danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
}

.metric-label {
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .metric-breakdown,
  .metric-divider {
    display: none;
  }
}

@media (max-width: 680px) {
  .app-bar {
    padding: 0.65rem 0.85rem;
    gap: 0.5rem;
  }

  .brand-subtitle {
    display: none;
  }

  .metrics-bar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding-top: 0.45rem;
    border-top: 1px solid var(--border-subtle);
    gap: 0.4rem;
  }

  .metric-pill {
    padding: 0.25rem 0.45rem;
  }

  .metric-label {
    font-size: 0.58rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .metric-value {
    font-size: 0.8rem;
  }
}
</style>
