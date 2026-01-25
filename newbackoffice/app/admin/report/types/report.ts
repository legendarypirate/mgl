export type ReportType = 'driver' | 'now' | 'later' | 'merchant';

export interface ReportRow {
  dateRange: string;
  name: string;
  deliveredDeliveries: number;
  totalDeliveries: number;
  totalPrice: number;
  salary: number;
  // Status 5 (хаягаар очсон) deliveries
  status5Deliveries: number;
  status5MerchantAmount: number; // 7k per delivery for merchant
  status5DriverAmount: number; // 5k per delivery for driver
  // Orders with status 3 (захиалгын тоо)
  orderCount: number;
}

