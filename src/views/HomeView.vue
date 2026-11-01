<script setup lang="ts">
import DistributionForm from '@/presentation/components/budget/DistributionForm.vue'
import DistributionGrid from '@/presentation/components/budget/DistributionGrid.vue'
import AppBar from '@/presentation/components/layout/AppBar.vue'
import { useBudgetDistribution } from '@/presentation/composables/useBudgetDistribution'

const {
  summary,
  filteredItems,
  activeCategoryFilter,
  errorMessage,
  updateFinancialBase,
  addAllocation,
  removeAllocation,
} = useBudgetDistribution()
</script>

<template>
  <div class="home-shell">
    <AppBar :summary="summary" />

    <main class="workspace-container">
      <div class="workspace">
        <div class="workspace-form">
          <DistributionForm
            :current-balance="summary.currentBalance"
            :monthly-salary="summary.monthlySalary"
            :exchange-rate="summary.exchangeRate"
            :error-message="errorMessage"
            @update-base="updateFinancialBase"
            @add-allocation="addAllocation"
          />
        </div>

        <div class="workspace-grid">
          <DistributionGrid
            :summary="summary"
            :items="filteredItems"
            :active-category="activeCategoryFilter"
            @remove-allocation="removeAllocation"
            @select-category="(category) => (activeCategoryFilter = category)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-bg);
}

.workspace-container {
  flex: 1;
  min-width: 0;
  padding: 0.875rem 1.25rem;
}

.workspace {
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.workspace-form {
  min-width: 0;
  position: sticky;
  top: 4.5rem;
}

.workspace-grid {
  min-width: 0;
}

@media (max-width: 920px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .workspace-form {
    position: static;
  }
}

@media (max-width: 640px) {
  .workspace-container {
    padding: 0.75rem;
  }
}
</style>
