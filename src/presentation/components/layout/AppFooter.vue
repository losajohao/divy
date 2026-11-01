<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <span>&copy; {{ currentYear }} <strong>Losa TI</strong>. Todos los derechos reservados.</span>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 0.65rem 1.5rem;
  background: var(--surface-card);
  border-top: 1px solid var(--border-subtle);
  text-align: center;
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.app-footer strong {
  color: var(--text-primary);
  font-weight: 600;
}
</style>

