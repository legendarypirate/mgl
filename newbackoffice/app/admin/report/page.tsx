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

  // Load drivers and merchants on mount
  useEffect(() => {
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
  }, []);

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

      // If a specific driver/merchant is selected, filter by it
      if (reportType === 'driver' && selectedId) {
        filters.driverId = selectedId;
      } else if (reportType === 'merchant' && selectedId) {
        filters.merchantId = selectedId;
      }

      const deliveries = await fetchReportDeliveries(filters);

      // Filter to only include deliveries with status 3 (already filtered in API, but double-check)
      const filteredDeliveries = deliveries.filter(
        (d) => d.status === 3 || d.status === '3'
      );

      // Group deliveries by driver or merchant
      const groupedData = groupDeliveriesByType(filteredDeliveries, reportType);

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
          const pricePerDelivery = reportType === 'driver' 
            ? 5000 
            : (groupDeliveries[0]?.merchant?.report_price || 7000);
          const salary = deliveredCount * pricePerDelivery;

          const name =
            reportType === 'driver'
              ? groupDeliveries[0]?.driver?.username || 'Unknown'
              : groupDeliveries[0]?.merchant?.username || 'Unknown';

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
    type: ReportType
  ): Record<string, Delivery[]> => {
    const grouped: Record<string, Delivery[]> = {};

    deliveries.forEach((delivery) => {
      // Group by username since that's what we have in the Delivery type
      // The API response may include IDs, but we'll use username as the key
      let key: string;
      if (type === 'driver') {
        // Group by driver username, or 'No Driver' if null
        key = delivery.driver?.username || 'No Driver';
      } else {
        // Group by merchant username
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

    // Prepare data for Excel
    const excelData = [
      // Headers
      [
        'Огноо',
        reportType === 'driver' ? 'Жолооч' : 'Дэлгүүр',
        'Хүргэсэн хүргэлт',
        'Нийт хүргэлт',
        'Нийт тооцоо',
        'Цалин',
        'зөрүү',
      ],
      // Data rows
      ...reportData.map((row) => [
        row.dateRange,
        row.name,
        row.deliveredDeliveries,
        row.totalDeliveries,
        row.totalPrice,
        row.salary,
        row.totalPrice - row.salary,
      ]),
      // Totals row
      [
        'Нийт',
        '',
        totals.deliveredDeliveries,
        totals.totalDeliveries,
        totals.totalPrice,
        totals.salary,
        totals.difference,
      ],
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Огноо
      { wch: 20 }, // Жолооч/Дэлгүүр
      { wch: 18 }, // Хүргэсэн хүргэлт
      { wch: 15 }, // Нийт хүргэлт
      { wch: 15 }, // Нийт тооцоо
      { wch: 15 }, // Цалин
      { wch: 15 }, // зөрүү
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate filename with date range
    const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
    const filename = `Report_${startDate}_${endDate}_${reportType}.xlsx`;

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

        {/* Report Type */}
        <Select
          value={reportType}
          onValueChange={(value) => setReportType(value as ReportType)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="merchant">Merchant</SelectItem>
          </SelectContent>
        </Select>

        {/* Conditional Select - Driver or Merchant */}
        {reportType === 'driver' ? (
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
              <TableHead>
                {reportType === 'driver' ? 'Жолооч' : 'Дэлгүүр'}
              </TableHead>
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
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reportData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No data available for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              <>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.dateRange}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
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
                  <TableCell className="font-bold"></TableCell>
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
