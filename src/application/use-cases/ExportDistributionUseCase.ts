import type { ExportBudgetPayload, IBudgetExporter } from '@/domain/services/IBudgetExporter'

export class ExportDistributionUseCase {
  constructor(private readonly exporter: IBudgetExporter) {}

  execute(payload: ExportBudgetPayload): void {
    this.exporter.export(payload)
  }
}

