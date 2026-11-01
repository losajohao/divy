import { Currency } from '@/domain/entities/Currency'
import { DISTRIBUTION_CATEGORIES } from '@/domain/entities/DistributionCategory'
import { INCOME_SOURCES } from '@/domain/entities/IncomeSource'
import type { ExportBudgetPayload, IBudgetExporter } from '@/domain/services/IBudgetExporter'

export class ExcelBudgetExporter implements IBudgetExporter {
  export(payload: ExportBudgetPayload): void {
    const { summary, incomes, items, filterName } = payload

    const escapeHtml = (value: string | number): string =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    const formatNumber = (num: number): string => num.toFixed(2)

    const getPercent = (amountPen: number): string => {
      if (summary.totalAvailable <= 0) return '0.0%'
      return `${((amountPen / summary.totalAvailable) * 100).toFixed(1)}%`
    }

    const incomeRowsHtml = incomes
      .map(
        (inc) => `
        <tr>
          <td>${escapeHtml(INCOME_SOURCES[inc.type].label)}</td>
          <td>Ingreso</td>
          <td>PEN (S/)</td>
          <td style="text-align:right;">${formatNumber(inc.amount)}</td>
          <td style="text-align:right;">${formatNumber(inc.amount)}</td>
          <td style="text-align:right;">${getPercent(inc.amount)}</td>
        </tr>`,
      )
      .join('')

    const allocationRowsHtml = items
      .map((item) => {
        const equivPen =
          item.currency === Currency.USD ? item.amount * summary.exchangeRate : item.amount
        const currencyLabel = item.currency === Currency.USD ? 'USD ($)' : 'PEN (S/)'

        return `
        <tr>
          <td>${escapeHtml(item.concept)}</td>
          <td>${escapeHtml(DISTRIBUTION_CATEGORIES[item.category].label)}</td>
          <td>${currencyLabel}</td>
          <td style="text-align:right;">${formatNumber(item.amount)}</td>
          <td style="text-align:right;">${formatNumber(equivPen)}</td>
          <td style="text-align:right;">${getPercent(equivPen)}</td>
        </tr>`
      })
      .join('')

    const dateStr = new Date().toISOString().slice(0, 10)

    const htmlDocument = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
          th { background-color: #1e40af; color: #ffffff; font-weight: bold; }
          .summary-label { background-color: #f1f5f9; font-weight: bold; }
          .title { font-size: 14pt; font-weight: bold; background-color: #eff6ff; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title">Divy — Reporte de Distribución (${escapeHtml(filterName)})</td>
          </tr>
          <tr>
            <td class="summary-label">Saldo Actual (S/)</td>
            <td style="text-align:right;">${formatNumber(summary.currentBalance)}</td>
            <td class="summary-label">Ingresos del Mes (S/)</td>
            <td style="text-align:right;">${formatNumber(summary.totalIncomes)}</td>
            <td class="summary-label">Tipo de Cambio ($ → S/)</td>
            <td style="text-align:right;">${formatNumber(summary.exchangeRate)}</td>
          </tr>
          <tr>
            <td class="summary-label">Bolsa Disponible (S/)</td>
            <td style="text-align:right;"><strong>${formatNumber(summary.totalAvailable)}</strong></td>
            <td class="summary-label">Total Distribuido (S/)</td>
            <td style="text-align:right;"><strong>${formatNumber(summary.totalAllocated)}</strong></td>
            <td class="summary-label">Saldo por Distribuir (S/)</td>
            <td style="text-align:right;"><strong>${formatNumber(summary.remainingBalance)}</strong></td>
          </tr>
          <tr><td colspan="6"></td></tr>
          <thead>
            <tr>
              <th>Concepto / Partida</th>
              <th>Categoría</th>
              <th>Moneda</th>
              <th>Monto Original</th>
              <th>En Soles (S/)</th>
              <th>% Disponible</th>
            </tr>
          </thead>
          <tbody>
            ${incomeRowsHtml}
            ${allocationRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff', htmlDocument], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `divy-distribucion-${dateStr}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

