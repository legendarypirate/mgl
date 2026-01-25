export type ReportType = 'driver' | 'now' | 'later';

export interface ReportRow {
  dateRange: string;
  name: string;
  deliveredDeliveries: number;
  totalDeliveries: number;
  totalPrice: number;
  salary: number;
}

