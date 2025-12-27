export type ReportType = 'driver' | 'merchant';

export interface ReportRow {
  dateRange: string;
  name: string;
  deliveredDeliveries: number;
  totalDeliveries: number;
  totalPrice: number;
  salary: number;
}

