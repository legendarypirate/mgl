"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { fetchReportDeliveries } from '../services/report.service';
import { fetchMerchants } from '../../delivery/services/delivery.service';
import { User, Delivery, DeliveryItem } from '../../delivery/types/delivery';

interface DeliveryWithItems extends Delivery {
  items: DeliveryItem[];
}

export default function ProductReportPage() {
  // State
  const [loading, setLoading] = useState(false);
  const [deliveriesWithItems, setDeliveriesWithItems] = useState<DeliveryWithItems[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const isCustomer = user?.role === 2 || user?.role_id === 2;

  // Filters
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null);
  const [productNameFilter, setProductNameFilter] = useState<string>('');

  // Data
  const [merchants, setMerchants] = useState<User[]>([]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load merchants on mount (only if not customer)
  useEffect(() => {
    if (isCustomer) return;
    
    const loadMerchants = async () => {
      try {
        const merchantsData = await fetchMerchants().catch(() => []);
        setMerchants(merchantsData);
      } catch (error) {
        console.error('Error loading merchants:', error);
      }
    };
    loadMerchants();
  }, [isCustomer]);

  // Auto-load today's statistics on initial load (wait for user to be loaded)
  useEffect(() => {
    if (user !== null) {
      loadReportData();
    }
  }, [user]);

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
        merchantId?: number;
      } = {
        startDate,
        endDate,
      };

      // If customer (role 2), automatically filter by their merchant ID
      if (isCustomer && user?.id) {
        filters.merchantId = user.id;
      } else if (selectedMerchantId) {
        filters.merchantId = selectedMerchantId;
      }

      // Fetch all delivered deliveries (status 3 or 5)
      const deliveries = await fetchReportDeliveries(filters);
      
      // Fetch items for each delivery
      const deliveriesWithItemsData: DeliveryWithItems[] = [];
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      for (const delivery of deliveries) {
        try {
          const itemsResponse = await fetch(`${API_URL}/api/delivery/${delivery.id}/items`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });

          if (itemsResponse.ok) {
            const itemsResult = await itemsResponse.json();
            if (itemsResult.success && Array.isArray(itemsResult.data)) {
              const items: DeliveryItem[] = itemsResult.data;
              
              // Filter by product name if provided
              let filteredItems = items;
              if (productNameFilter.trim()) {
                filteredItems = items.filter(item => 
                  item.good?.name?.toLowerCase().includes(productNameFilter.toLowerCase())
                );
              }
              
              // Only add delivery if it has items (or if no product filter is set)
              if (filteredItems.length > 0 || !productNameFilter.trim()) {
                deliveriesWithItemsData.push({
                  ...delivery,
                  items: filteredItems,
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch items for delivery ${delivery.id}:`, error);
        }
      }
      
      setDeliveriesWithItems(deliveriesWithItemsData);
    } catch (error: any) {
      console.error('Error loading product report data:', error);
      toast.error(error.message || 'Failed to load product report data');
    } finally {
      setLoading(false);
    }
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
  const totals = deliveriesWithItems.reduce(
    (acc, delivery) => {
      const items = delivery.items || [];
      acc.totalQuantity += items.reduce((sum, item) => sum + item.quantity, 0);
      acc.totalCount += 1; // Count each delivery once
      acc.totalPrice += parseFloat(delivery.price?.toString() || '0');
      return acc;
    },
    {
      totalQuantity: 0,
      totalCount: 0,
      totalPrice: 0,
    }
  );

  const exportToExcel = () => {
    if (deliveriesWithItems.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Prepare data for Excel - similar to delivery page export
    const excelData: any[] = [];
    const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
    const dateRangeStr = `${startDate} ~ ${endDate}`;

    deliveriesWithItems.forEach((delivery) => {
      const items = delivery.items || [];
      const deliveryDate = delivery.delivery_date
        ? format(new Date(delivery.delivery_date), 'yyyy-MM-dd')
        : delivery.createdAt
        ? format(new Date(delivery.createdAt), 'yyyy-MM-dd')
        : '-';

      if (items.length === 0) {
        excelData.push({
          Огноо: dateRangeStr,
          'Хүргэлтийн огноо': deliveryDate,
          Бараа: '-',
          Тоо: '-',
          Дэлгүүр: !isCustomer ? (delivery.merchant?.username || '-') : undefined,
          Үнэ: delivery.price || 0,
        });
      } else {
        items.forEach((item, itemIndex) => {
          excelData.push({
            Огноо: itemIndex === 0 ? dateRangeStr : '',
            'Хүргэлтийн огноо': itemIndex === 0 ? deliveryDate : '',
            Бараа: item.good?.name || 'Unknown',
            Тоо: item.quantity,
            Дэлгүүр: !isCustomer && itemIndex === 0 ? (delivery.merchant?.username || '-') : (!isCustomer ? '' : undefined),
            Үнэ: itemIndex === 0 ? (delivery.price || 0) : '',
          });
        });
      }
    });

    // Add totals row
    excelData.push({
      Огноо: 'Нийт',
      'Хүргэлтийн огноо': '',
      Бараа: '',
      Тоо: totals.totalQuantity,
      Дэлгүүр: !isCustomer ? '' : undefined,
      Үнэ: totals.totalPrice,
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Report');
    
    const filename = `Product_Report_${startDate}_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
    toast.success('Report exported successfully');
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Барааны тайлан</h1>
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

        {/* Merchant Filter - Hide for customers (role 2) */}
        {!isCustomer && (
          <SearchableSelect
            options={[
              { value: 'all', label: 'All Merchants' },
              ...merchants.map((merchant) => ({
                value: merchant.id.toString(),
                label: merchant.username,
              })),
            ]}
            value={selectedMerchantId?.toString() || 'all'}
            onValueChange={(value) =>
              setSelectedMerchantId(value === 'all' ? null : parseInt(value))
            }
            placeholder="Select Merchant"
            className="w-48"
          />
        )}

        {/* Product Name Filter */}
        <Input
          type="text"
          placeholder="Барааны нэрээр хайх..."
          value={productNameFilter}
          onChange={(e) => setProductNameFilter(e.target.value)}
          className="w-48"
        />

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </Button>

        {/* Export Button */}
        <Button
          onClick={exportToExcel}
          disabled={loading || deliveriesWithItems.length === 0}
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
              <TableHead>Хүргэлтийн огноо</TableHead>
              {!isCustomer && <TableHead>Дэлгүүр</TableHead>}
              <TableHead>Бараа</TableHead>
              <TableHead>Тоо</TableHead>
              <TableHead>Үнэ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isCustomer ? 5 : 6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : deliveriesWithItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isCustomer ? 5 : 6} className="text-center py-8 text-gray-500">
                  No data available for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              <>
                {deliveriesWithItems.map((delivery) => {
                  const items = delivery.items || [];
                  const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
                  const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
                  const dateRangeStr = `${startDate} ~ ${endDate}`;
                  const deliveryDate = delivery.delivery_date
                    ? format(new Date(delivery.delivery_date), 'yyyy-MM-dd')
                    : delivery.createdAt
                    ? format(new Date(delivery.createdAt), 'yyyy-MM-dd')
                    : '-';

                  if (items.length === 0) {
                    return (
                      <TableRow key={delivery.id}>
                        <TableCell>{dateRangeStr}</TableCell>
                        <TableCell>{deliveryDate}</TableCell>
                        {!isCustomer && (
                          <TableCell>{delivery.merchant?.username || '-'}</TableCell>
                        )}
                        <TableCell className="max-w-xs">
                          <div className="text-sm">-</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">-</div>
                        </TableCell>
                        <TableCell>{formatCurrency(parseFloat(delivery.price?.toString() || '0'))} ₮</TableCell>
                      </TableRow>
                    );
                  }

                  return items.map((item, itemIndex) => (
                    <TableRow
                      key={`${delivery.id}-${itemIndex}`}
                      className={itemIndex > 0 ? 'border-t border-gray-300' : ''}
                    >
                      {itemIndex === 0 && (
                        <>
                          <TableCell rowSpan={items.length}>{dateRangeStr}</TableCell>
                          <TableCell rowSpan={items.length}>{deliveryDate}</TableCell>
                          {!isCustomer && (
                            <TableCell rowSpan={items.length}>
                              {delivery.merchant?.username || '-'}
                            </TableCell>
                          )}
                        </>
                      )}
                      <TableCell className="max-w-xs">
                        <div className="text-sm">{item.good?.name || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.quantity}</div>
                      </TableCell>
                      {itemIndex === 0 && (
                        <TableCell rowSpan={items.length}>
                          {formatCurrency(parseFloat(delivery.price?.toString() || '0'))} ₮
                        </TableCell>
                      )}
                    </TableRow>
                  ));
                })}
                {/* Totals Row */}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell className="font-bold">Нийт</TableCell>
                  <TableCell className="font-bold"></TableCell>
                  {!isCustomer && <TableCell className="font-bold"></TableCell>}
                  <TableCell className="font-bold"></TableCell>
                  <TableCell className="font-bold">{totals.totalQuantity}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totals.totalPrice)} ₮
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

