"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { fetchReportDeliveries } from './services/report.service';
import { fetchDrivers, fetchMerchants } from '../delivery/services/delivery.service';
import { Delivery, User } from '../delivery/types/delivery';
import { ReportRow, ReportType } from './types/report';

export default function ReportPage() {
  // State
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportRow[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const isCustomer = user?.role === 2 || user?.role_id === 2;

  // Filters
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [reportType, setReportType] = useState<ReportType>('driver');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Data
  const [drivers, setDrivers] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<User[]>([]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load drivers and merchants on mount (only if not customer)
  useEffect(() => {
    if (isCustomer) return;
    
    const loadUsers = async () => {
      try {
        const [driversData, merchantsData] = await Promise.all([
          fetchDrivers().catch(() => []),
          fetchMerchants().catch(() => []),
        ]);
        setDrivers(driversData);
        setMerchants(merchantsData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, [isCustomer]);

  // Auto-load today's statistics on initial load
  useEffect(() => {
    loadReportData();
  }, []);

  // Reset selected ID when report type changes
  useEffect(() => {
    setSelectedId(null);
  }, [reportType]);

  const loadReportData = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      toast.error('Please select a date range');
      return;
    }

    setLoading(true);
    try {
      const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');

      const filters: {
        startDate: string;
        endDate: string;
        driverId?: number;
        merchantId?: number;
      } = {
        startDate,
        endDate,
      };

      // If customer (role 2), automatically filter by their merchant ID
      if (isCustomer && user?.id) {
        filters.merchantId = user.id;
      } else {
        // If a specific driver/merchant is selected, filter by it
        if (reportType === 'driver' && selectedId) {
          filters.driverId = selectedId;
        } else if ((reportType === 'now' || reportType === 'later') && selectedId) {
          filters.merchantId = selectedId;
        }
      }

      const deliveries = await fetchReportDeliveries(filters);

      // Filter to only include deliveries with status 3 (already filtered in API, but double-check)
      const filteredDeliveries = deliveries.filter(
        (d) => d.status === 3 || d.status === '3'
      );

      // Filter merchants by зөрүү (difference) based on report type
      // Skip this filtering for customers (role 2) - show all their deliveries
      let deliveriesToProcess = filteredDeliveries;
      if (!isCustomer && (reportType === 'now' || reportType === 'later')) {
        // Group by merchant first to calculate difference
        const merchantGroups: Record<string, Delivery[]> = {};
        filteredDeliveries.forEach((delivery) => {
          const key = delivery.merchant?.username || 'Unknown Merchant';
          if (!merchantGroups[key]) {
            merchantGroups[key] = [];
          }
          merchantGroups[key].push(delivery);
        });

        // Filter merchants based on зөрүү
        deliveriesToProcess = [];
        Object.entries(merchantGroups).forEach(([merchantName, merchantDeliveries]) => {
          const totalPrice = merchantDeliveries.reduce(
            (sum, d) => sum + parseFloat(d.price.toString()),
            0
          );
          const pricePerDelivery = merchantDeliveries[0]?.merchant?.report_price || 7000;
          const salary = merchantDeliveries.length * pricePerDelivery;
          const difference = totalPrice - salary;

          // Now: difference >= 0, Later: difference < 0
          if ((reportType === 'now' && difference >= 0) || 
              (reportType === 'later' && difference < 0)) {
            deliveriesToProcess.push(...merchantDeliveries);
          }
        });
      }

      // Group deliveries by driver or merchant
      // For customers, always group by merchant (their own data)
      const typeToUse = isCustomer ? 'now' : reportType;
      const groupedData = groupDeliveriesByType(deliveriesToProcess, typeToUse, isCustomer, user);

      // Calculate statistics for each group
      const reportRows: ReportRow[] = Object.entries(groupedData).map(
        ([id, groupDeliveries]) => {
          // All deliveries are already status 3, so deliveredCount equals totalCount
          const deliveredCount = groupDeliveries.length;
          const totalCount = groupDeliveries.length;
          const totalPrice = groupDeliveries.reduce(
            (sum, d) => sum + parseFloat(d.price.toString()),
            0
          );
          
          // Calculate salary: for drivers use 5000, for merchants use their report_price (default 7000)
          const typeToUse = isCustomer ? 'now' : reportType;
          const pricePerDelivery = typeToUse === 'driver' 
            ? 5000 
            : (groupDeliveries[0]?.merchant?.report_price || 7000);
          const salary = deliveredCount * pricePerDelivery;

          const name =
            typeToUse === 'driver'
              ? groupDeliveries[0]?.driver?.username || 'Unknown'
              : (isCustomer && user?.username ? user.username : groupDeliveries[0]?.merchant?.username || 'Unknown');

          return {
            dateRange: `${startDate} ~ ${endDate}`,
            name,
            deliveredDeliveries: deliveredCount,
            totalDeliveries: totalCount,
            totalPrice,
            salary,
          };
        }
      );

      setReportData(reportRows);
    } catch (error: any) {
      console.error('Error loading report data:', error);
      toast.error(error.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const groupDeliveriesByType = (
    deliveries: Delivery[],
    type: ReportType,
    isCustomer: boolean = false,
    user: any = null
  ): Record<string, Delivery[]> => {
    const grouped: Record<string, Delivery[]> = {};

    deliveries.forEach((delivery) => {
      // Group by username since that's what we have in the Delivery type
      // The API response may include IDs, but we'll use username as the key
      let key: string;
      if (isCustomer) {
        // For merchants (customers), group ALL deliveries into a single group
        // Use a static key to ensure all deliveries are aggregated together
        key = 'merchant_summary';
      } else if (type === 'driver') {
        // Group by driver username, or 'No Driver' if null
        key = delivery.driver?.username || 'No Driver';
      } else {
        // Group by merchant username (for both 'now' and 'later')
        key = delivery.merchant?.username || 'Unknown Merchant';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(delivery);
    });

    return grouped;
  };

  const handleSubmit = () => {
    loadReportData();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totals = reportData.reduce(
    (acc, row) => {
      acc.deliveredDeliveries += row.deliveredDeliveries;
      acc.totalDeliveries += row.totalDeliveries;
      acc.totalPrice += row.totalPrice;
      acc.salary += row.salary;
      acc.difference += row.totalPrice - row.salary;
      return acc;
    },
    {
      deliveredDeliveries: 0,
      totalDeliveries: 0,
      totalPrice: 0,
      salary: 0,
      difference: 0,
    }
  );

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Determine report type to use
    const typeToUse = isCustomer ? 'now' : reportType;

    // Prepare data for Excel
    const headers = ['Огноо'];
    if (!isCustomer) {
      headers.push(typeToUse === 'driver' ? 'Жолооч' : 'Дэлгүүр');
    }
    headers.push('Хүргэсэн хүргэлт', 'Нийт хүргэлт', 'Нийт тооцоо', 'Цалин', 'зөрүү');

    const excelData = [
      // Headers
      headers,
      // Data rows
      ...reportData.map((row) => {
        const rowData: (string | number)[] = [row.dateRange];
        if (!isCustomer) {
          rowData.push(row.name);
        }
        rowData.push(
          row.deliveredDeliveries,
          row.totalDeliveries,
          row.totalPrice,
          row.salary,
          row.totalPrice - row.salary
        );
        return rowData;
      }),
      // Totals row
      (() => {
        const totalsRow: (string | number)[] = ['Нийт'];
        if (!isCustomer) {
          totalsRow.push('');
        }
        totalsRow.push(
          totals.deliveredDeliveries,
          totals.totalDeliveries,
          totals.totalPrice,
          totals.salary,
          totals.difference
        );
        return totalsRow;
      })(),
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const columnWidths = [{ wch: 20 }]; // Огноо
    if (!isCustomer) {
      columnWidths.push({ wch: 20 }); // Жолооч/Дэлгүүр
    }
    columnWidths.push(
      { wch: 18 }, // Хүргэсэн хүргэлт
      { wch: 15 }, // Нийт хүргэлт
      { wch: 15 }, // Нийт тооцоо
      { wch: 15 }, // Цалин
      { wch: 15 }  // зөрүү
    );
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate filename with date range
    const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
    const filename = `Report_${startDate}_${endDate}_${typeToUse}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success('Report exported successfully');
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Report</h1>
      </div>

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dayjs(dateRange[0]).format('YYYY-MM-DD')}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              setDateRange([date, dateRange[1]]);
            }}
            className="w-40"
          />
          <span className="text-gray-500">~</span>
          <Input
            type="date"
            value={dayjs(dateRange[1]).format('YYYY-MM-DD')}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              setDateRange([dateRange[0], date]);
            }}
            className="w-40"
          />
        </div>

        {/* Report Type - Hide for customers (role 2) */}
        {!isCustomer && (
          <Select
            value={reportType}
            onValueChange={(value) => setReportType(value as ReportType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="now">Now</SelectItem>
              <SelectItem value="later">Later</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Conditional Select - Driver or Merchant - Hide for customers (role 2) */}
        {!isCustomer && (
          reportType === 'driver' ? (
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Drivers' },
                ...drivers.map((driver) => ({
                  value: driver.id.toString(),
                  label: driver.username,
                })),
              ]}
              value={selectedId?.toString() || 'all'}
              onValueChange={(value) =>
                setSelectedId(value === 'all' ? null : parseInt(value))
              }
              placeholder="Select Driver"
              className="w-48"
            />
          ) : (
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Merchants' },
                ...merchants.map((merchant) => ({
                  value: merchant.id.toString(),
                  label: merchant.username,
                })),
              ]}
              value={selectedId?.toString() || 'all'}
              onValueChange={(value) =>
                setSelectedId(value === 'all' ? null : parseInt(value))
              }
              placeholder="Select Merchant"
              className="w-48"
            />
          )
        )}

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </Button>

        {/* Export Button */}
        <Button
          onClick={exportToExcel}
          disabled={loading || reportData.length === 0}
          variant="outline"
        >
          Export to Excel
        </Button>
      </div>

      {/* Report Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Огноо</TableHead>
              {!isCustomer && (
                <TableHead>
                  {(isCustomer ? 'now' : reportType) === 'driver' ? 'Жолооч' : 'Дэлгүүр'}
                </TableHead>
              )}
              <TableHead>Хүргэсэн хүргэлт</TableHead>
              <TableHead>Нийт хүргэлт</TableHead>
              <TableHead>Нийт тооцоо</TableHead>
              <TableHead>Цалин</TableHead>
              <TableHead>зөрүү</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isCustomer ? 6 : 7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reportData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isCustomer ? 6 : 7} className="text-center py-8 text-gray-500">
                  No data available for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              <>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.dateRange}</TableCell>
                    {!isCustomer && (
                      <TableCell className="font-medium">{row.name}</TableCell>
                    )}
                    <TableCell>{row.deliveredDeliveries}</TableCell>
                    <TableCell>{row.totalDeliveries}</TableCell>
                    <TableCell>{formatCurrency(row.totalPrice)} ₮</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(row.salary)} ₮
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(row.totalPrice - row.salary)} ₮
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell className="font-bold">Нийт</TableCell>
                  {!isCustomer && <TableCell className="font-bold"></TableCell>}
                  <TableCell className="font-bold">{totals.deliveredDeliveries}</TableCell>
                  <TableCell className="font-bold">{totals.totalDeliveries}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totals.totalPrice)} ₮
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totals.salary)} ₮
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totals.difference)} ₮
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
