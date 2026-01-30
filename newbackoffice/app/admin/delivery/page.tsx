"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import DeliveryTable from './components/DeliveryTable';
import DeliveryFilters from './components/DeliveryFilters';
import DeliveryForm from './components/DeliveryForm';
import {
  DriverAllocationModal,
  StatusChangeModal,
  HistoryModal,
  EditModal,
  DeliveryDateModal,
} from './components/DeliveryModals';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Delivery,
  DeliveryItem,
  DeliveryHistory,
  DeliveryStatus,
  User,
  District,
  DeliveryFilters as Filters,
  ProductItem,
  Region,
} from './types/delivery';
import {
  fetchDeliveries,
  fetchDeliveryItems,
  fetchDeliveryHistory,
  createDelivery,
  updateDelivery,
  deleteDeliveries,
  allocateDeliveries,
  changeDeliveryStatus,
  updateDeliveryDates,
  fetchMerchants,
  fetchDrivers,
  fetchStatuses,
  fetchProducts,
  importDeliveries,
  fetchRegions,
} from './services/delivery.service';
import { useSearchParams } from 'next/navigation';
import { formatDateLocal, getTodayLocal } from '@/lib/utils';

const DISTRICTS: District[] = [
  { id: 1, name: 'Баянзүрх' },
  { id: 2, name: 'Хан-Уул' },
  { id: 3, name: 'Сүхбаатар' },
  { id: 4, name: 'Чингэлтэй' },
  { id: 5, name: 'Сонгинохайрхан' },
  { id: 6, name: 'Баянгол' },
  { id: 7, name: 'Орон нутаг' },
];

function DeliveryPageContent() {
  const searchParams = useSearchParams();
  const statusIdsParam = searchParams.get('status_ids') || '';
  const initialStatusIds = statusIdsParam
    ? statusIdsParam.split(',').map((id) => parseInt(id))
    : [];
  const merchantIdParam = searchParams.get('merchant_id');
  const initialMerchantId = merchantIdParam ? parseInt(merchantIdParam) : null;

  // State
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [phoneFilter, setPhoneFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<number | null>(initialMerchantId);
  const [driverFilter, setDriverFilter] = useState<number | null>(null);
  const [districtFilter, setDistrictFilter] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>(initialStatusIds);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [today, today];
  });

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pullFromWarehouse, setPullFromWarehouse] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string; stock: number }>>([]);

  // Modals
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeliveryDateModalOpen, setIsDeliveryDateModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [bulkDeliveryDate, setBulkDeliveryDate] = useState('');
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistory[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [editFormData, setEditFormData] = useState({ phone: '', address: '', price: '', delivery_date: '' });

  // Expanded rows
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<number, DeliveryItem[] | null>>({});
  const [loadingRows, setLoadingRows] = useState<number[]>([]);

  // Data
  const [merchants, setMerchants] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [statusList, setStatusList] = useState<DeliveryStatus[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const isMerchant = user?.role === 2;
  const merchantId = isMerchant ? user.id : null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial data
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedPermissions =
      typeof window !== 'undefined' ? localStorage.getItem('permissions') : null;
    const storedUsername =
      typeof window !== 'undefined' ? localStorage.getItem('username') : null;

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedPermissions) setPermissions(JSON.parse(storedPermissions));
    if (storedUsername) setUsername(storedUsername);

    const loadData = async () => {
      try {
        const [merchantsData, driversData, statusesData, regionsData] = await Promise.all([
          fetchMerchants().catch(() => []),
          fetchDrivers().catch(() => []),
          fetchStatuses().catch(() => []),
          fetchRegions().catch(() => []),
        ]);

        setMerchants(merchantsData);
        setDrivers(driversData);
        setStatusList(statusesData);
        setRegions(regionsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadData();
  }, []);

  // Fetch deliveries
  useEffect(() => {
    const loadDeliveries = async () => {
      setLoading(true);
      try {
        const filters: Filters = {
          phone: phoneFilter || undefined,
          merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
          driverId: driverFilter || undefined,
          districtId: districtFilter || undefined,
          statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          startDate: dateRange[0] ? formatDateLocal(dateRange[0]) : undefined,
          endDate: dateRange[1] ? formatDateLocal(dateRange[1]) : undefined,
        };

        const result = await fetchDeliveries(filters, pagination);
        setDeliveries(result.data);
        setPagination((prev) => ({ ...prev, total: result.pagination.total }));
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        toast.error('Хүргэлт ачааллахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, [
    pagination.current,
    pagination.pageSize,
    phoneFilter,
    merchantFilter,
    driverFilter,
    districtFilter,
    selectedStatuses,
    dateRange,
    isMerchant,
    merchantId,
    refreshTrigger,
  ]);

  // Handlers
  const handleExpand = async (expanded: boolean, record: Delivery) => {
    if (expanded) {
      setExpandedRowKeys([record.id]);
      if (!expandedItems[record.id]) {
        setLoadingRows((prev) => [...prev, record.id]);
        try {
          const items = await fetchDeliveryItems(record.id);
          setExpandedItems((prev) => ({ ...prev, [record.id]: items }));
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoadingRows((prev) => prev.filter((id) => id !== record.id));
        }
      }
    } else {
      setExpandedRowKeys([]);
    }
  };

  const handleCreateDelivery = async (payload: any) => {
    await createDelivery(payload);
    toast.success('Амжилттай бүртгэгдлээ');
    setPullFromWarehouse(false);
    setProducts([]);
    // Refresh deliveries - reset to page 1 to show new delivery
    setPagination((prev) => ({ ...prev, current: 1 }));
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEdit = async () => {
    if (!selectedDelivery) return;
    try {
      await updateDelivery(selectedDelivery.id, {
        phone: editFormData.phone,
        address: editFormData.address,
        price: editFormData.price === '' ? 0 : Number(editFormData.price),
        delivery_date: editFormData.delivery_date || undefined,
      });
      toast.success('Амжилттай шинэчлэгдлээ');
      setIsEditModalOpen(false);
      // Refresh deliveries - trigger useEffect
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDelete = async () => {
    const selectedDeliveries = deliveries.filter((item) => selectedRowKeys.includes(item.id));
    const nonDeletable = selectedDeliveries.filter((item) => item.status !== 1);

    if (nonDeletable.length > 0) {
      toast.warning('Устгах боломжгүй хүргэлт байна.');
      return;
    }

    if (!confirm(`Та ${selectedRowKeys.length} ширхэг хүргэлтийг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    try {
      await deleteDeliveries(selectedRowKeys);
      toast.success('Амжилттай устгагдлаа');
      setSelectedRowKeys([]);
      // Refresh deliveries - trigger useEffect
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Устгахад алдаа гарлаа');
    }
  };

  const handleAllocateToDriver = async () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Хамгийн багадаа нэг хүргэлт сонгоно уу');
      return;
    }
    setIsDriverModalOpen(true);
  };

  const handleSaveAllocation = async () => {
    if (!selectedDriverId) {
      toast.warning('Жолооч сонгоно уу!');
      return;
    }
    try {
      await allocateDeliveries(selectedDriverId, selectedRowKeys);
      toast.success('Амжилттай хуваарилагдлаа');
      setIsDriverModalOpen(false);
      setSelectedDriverId(null);
      setSelectedRowKeys([]);
      // Refresh deliveries - trigger useEffect
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Хуваарилахад алдаа гарлаа');
    }
  };

  const handleStatusChange = async () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Хамгийн багадаа нэг хүргэлт сонгоно уу');
      return;
    }
    setIsStatusModalOpen(true);
  };

  const handleDeliveryDateChange = async () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Хамгийн багадаа нэг хүргэлт сонгоно уу');
      return;
    }
    const today = getTodayLocal();
    setBulkDeliveryDate(today);
    setIsDeliveryDateModalOpen(true);
  };

  const handleSaveDeliveryDate = async () => {
    if (!bulkDeliveryDate) {
      toast.warning('Огноо сонгоно уу!');
      return;
    }
    try {
      await updateDeliveryDates(bulkDeliveryDate, selectedRowKeys);
      toast.success('Амжилттай өөрчлөгдлөө');
      setIsDeliveryDateModalOpen(false);
      setBulkDeliveryDate('');
      setSelectedRowKeys([]);
      // Refresh deliveries - trigger useEffect
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Огноо өөрчлөхөд алдаа гарлаа');
    }
  };

  const handleSaveStatusChange = async () => {
    if (!selectedStatusId) {
      toast.warning('Төлөв сонгоно уу!');
      return;
    }
    try {
      await changeDeliveryStatus(selectedStatusId, selectedRowKeys);
      toast.success('Амжилттай өөрчлөгдлөө');
      setIsStatusModalOpen(false);
      setSelectedStatusId(null);
      setSelectedRowKeys([]);
      // Refresh deliveries - trigger useEffect
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Төлөв өөрчлөхөд алдаа гарлаа');
    }
  };

  const handleViewHistory = async (deliveryId: number) => {
    try {
      const history = await fetchDeliveryHistory(deliveryId);
      setDeliveryHistory(history);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error('Түүх ачааллахад алдаа гарлаа');
    }
  };

  const handleEditClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    const deliveryDate = delivery.delivery_date 
      ? formatDateLocal(new Date(delivery.delivery_date))
      : getTodayLocal();
    setEditFormData({
      phone: delivery.phone,
      address: delivery.address,
      price: delivery.price.toString(),
      delivery_date: deliveryDate,
    });
    setIsEditModalOpen(true);
  };

  const handleProductsFetch = async (merchantId: number) => {
    try {
      const fetchedProducts = await fetchProducts(merchantId);
      setProducts(fetchedProducts);
    } catch (error) {
      toast.error('Барааг ачааллахад алдаа гарлаа');
      setProducts([]);
    }
  };

  const handleExcelImport = () => {
    fileInputRef.current?.click();
  };

  const processExcelFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const rows = json.slice(1) as any[];
        const formatted = rows.map((row) => ({
          merchantName: row[0],
          phone: row[1],
          address: row[2],
          price: row[3],
          comment: row[4],
        }));

        const result = await importDeliveries(formatted);
        toast.success(`${result.inserted || formatted.length} хүргэлт амжилттай импортлогдлоо`);
        // Refresh deliveries - reset to page 1 to show new deliveries
        setPagination((prev) => ({ ...prev, current: 1 }));
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        toast.error('Импорт хийхэд алдаа гарлаа');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      processExcelFile(file);
    }
  };

  const handlePrint = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const selectedIds = selectedRowKeys.map((id) => Number(id));
      const missingIds = selectedIds.filter(
        (id) => !expandedItems[id] && !loadingRows.includes(id)
      );

      if (missingIds.length > 0) {
        setLoadingRows((prev) => [...prev, ...missingIds]);
        const promises = missingIds.map((id) => fetchDeliveryItems(id));
        const results = await Promise.all(promises);
        const newExpandedItems = { ...expandedItems };
        missingIds.forEach((id, index) => {
          newExpandedItems[id] = results[index];
        });
        setExpandedItems(newExpandedItems);
        setLoadingRows((prev) => prev.filter((id) => !missingIds.includes(id)));
      }

      const selectedRows = deliveries.filter((item) => selectedRowKeys.includes(item.id));
      const allItems = { ...expandedItems };
      for (const id of selectedIds) {
        if (!allItems[id]) {
          allItems[id] = await fetchDeliveryItems(id);
        }
      }

      const rowsWithItems = selectedRows.map((row) => ({
        ...row,
        items: allItems[row.id] || [],
      }));

      const uniqueDrivers = [
        ...new Set(rowsWithItems.map((row) => row.driver?.username).filter(Boolean)),
      ].join(', ');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 18px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 20px; }
                .logo { max-width: 200px; height: auto; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 16px; }
                th, td { border: 1px solid #ccc; padding: 10px 12px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; font-size: 18px; }
                @page { size: A4 portrait; margin: 10mm; }
              </style>
            </head>
            <body>
              <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start;">
             
                ${uniqueDrivers ? `<div style="flex: 1; text-align: left; font-size: 18px;"><div style="font-weight: bold;">Жолооч:</div><div>${uniqueDrivers}</div></div>` : ''}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Дэлгүүр</th>
                    <th>Утас</th>
                    <th>Бараа</th>
                    <th>Тоо</th>
                    <th>Үнэ</th>
                    <th>Хаяг</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsWithItems
                    .map((row, rowIndex) => {
                      const items = row.items || [];
                      const rowNumber = rowIndex + 1;
                      if (items.length === 0) {
                        return `
                          <tr>
                            <td>${rowNumber}</td>
                            <td>${row.merchant?.username ?? '-'}</td>
                            <td>${row.phone}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${row.price?.toLocaleString() ?? '0'}₮</td>
                            <td>${row.address}</td>
                          </tr>
                        `;
                      }
                      return items
                        .map(
                          (item: any, index: number) => `
                          <tr ${index > 0 ? 'style="border-top: 1px solid #ddd;"' : ''}>
                            ${index === 0 ? `
                              <td rowspan="${items.length}">${rowNumber}</td>
                              <td rowspan="${items.length}">${row.merchant?.username ?? '-'}</td>
                              <td rowspan="${items.length}">${row.phone}</td>
                            ` : ''}
                            <td>${item.good?.name || 'Unknown'}</td>
                            <td>${item.quantity}</td>
                            ${index === 0 ? `
                              <td rowspan="${items.length}">${row.price?.toLocaleString() ?? '0'}₮</td>
                              <td rowspan="${items.length}">${row.address}</td>
                            ` : ''}
                          </tr>
                        `
                        )
                        .join('');
                    })
                    .join('')}
                </tbody>
              </table>
              <div style="margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold;">
                Нийт: ${rowsWithItems.length} хүргэлт
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast.error('Хэвлэхэд алдаа гарлаа');
    }
  };

  const handleExportExcel = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const selectedIds = selectedRowKeys.map((id) => Number(id));
      const selectedRows = deliveries.filter((item) => selectedRowKeys.includes(item.id));
      
      // Fetch items for all selected deliveries (similar to print logic)
      const missingIds = selectedIds.filter(
        (id) => !expandedItems[id] && !loadingRows.includes(id)
      );

      if (missingIds.length > 0) {
        setLoadingRows((prev) => [...prev, ...missingIds]);
        const promises = missingIds.map((id) => fetchDeliveryItems(id));
        const results = await Promise.all(promises);
        const newExpandedItems = { ...expandedItems };
        missingIds.forEach((id, index) => {
          newExpandedItems[id] = results[index];
        });
        setExpandedItems(newExpandedItems);
        setLoadingRows((prev) => prev.filter((id) => !missingIds.includes(id)));
      }

      // Get all items for selected deliveries
      const allItems = { ...expandedItems };
      for (const id of selectedIds) {
        if (!allItems[id]) {
          allItems[id] = await fetchDeliveryItems(id);
        }
      }

      // Create rows with items (one row per item, similar to print logic)
      const excelData: any[] = [];
      const deliveryRowRanges: Array<{ startRow: number; endRow: number }> = [];
      let currentRowIndex = 1; // Start at 1 (0 is header)
      
      selectedRows.forEach((row) => {
        const items = allItems[row.id] || [];
        const statusName = row.status_name?.status || '-';
        const startRow = currentRowIndex;
        
        if (items.length === 0) {
          // No items - create one row with empty good info
          excelData.push({
            Дэлгүүр: row.merchant?.username ?? '-',
            Хаяг: row.address,
            Утас: row.phone,
            Бараа: '-',
            Тоо: '-',
            Төлөв: statusName,
            Үнэ: row.price,
            Тайлбар: row.comment ?? '-',
          });
          currentRowIndex++;
        } else {
          // Multiple items - create one row per item, but only populate delivery info in first row
          items.forEach((item: DeliveryItem, itemIndex: number) => {
            excelData.push({
              Дэлгүүр: itemIndex === 0 ? row.merchant?.username ?? '-' : '',
              Хаяг: itemIndex === 0 ? row.address : '',
              Утас: itemIndex === 0 ? row.phone : '',
              Бараа: item.good?.name || 'Unknown',
              Тоо: item.quantity,
              Төлөв: itemIndex === 0 ? statusName : '',
              Үнэ: itemIndex === 0 ? row.price : '',
              Тайлбар: itemIndex === 0 ? (row.comment ?? '-') : '',
            });
            currentRowIndex++;
          });
        }
        
        const endRow = currentRowIndex - 1;
        if (endRow > startRow) {
          // Multiple rows for this delivery - need to merge
          deliveryRowRanges.push({ startRow, endRow });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Merge cells for delivery-specific columns when there are multiple items
      // Column indices: Дэлгүүр=0, Хаяг=1, Утас=2, Бараа=3, Тоо=4, Төлөв=5, Үнэ=6, Тайлбар=7
      const columnsToMerge = [0, 1, 2, 5, 6, 7]; // Дэлгүүр, Хаяг, Утас, Төлөв, Үнэ, Тайлбар
      
      if (!worksheet['!merges']) {
        worksheet['!merges'] = [];
      }
      
      const merges = worksheet['!merges'];
      if (merges) {
        deliveryRowRanges.forEach(({ startRow, endRow }) => {
          columnsToMerge.forEach((colIndex) => {
            merges.push({
              s: { r: startRow, c: colIndex }, // start row, column
              e: { r: endRow, c: colIndex },   // end row, column
            });
          });
        });
      }
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Deliveries');
      XLSX.writeFile(workbook, 'selected_deliveries.xlsx');
      toast.success('Excel файл амжилттай экспортлогдлоо');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Excel экспорт хийхэд алдаа гарлаа');
    }
  };

  const hasPermission = (perm: string) => permissions.includes(perm);

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Хүргэлт</h1>
      </div>

      <DeliveryFilters
        phoneFilter={phoneFilter}
        onPhoneFilterChange={setPhoneFilter}
        merchants={merchants}
        selectedMerchantId={merchantFilter}
        onMerchantFilterChange={setMerchantFilter}
        drivers={drivers}
        selectedDriverId={driverFilter}
        onDriverFilterChange={setDriverFilter}
        districts={DISTRICTS}
        selectedDistrictId={districtFilter}
        onDistrictFilterChange={setDistrictFilter}
        statusList={statusList}
        selectedStatuses={selectedStatuses}
        onStatusToggle={(statusId) => {
          setSelectedStatuses((prev) =>
            prev.includes(statusId) ? prev.filter((id) => id !== statusId) : [...prev, statusId]
          );
        }}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onAddDelivery={() => setIsDrawerOpen(true)}
        onExcelImport={handleExcelImport}
        hasPermission={hasPermission}
        fileInputRef={fileInputRef}
        isMerchant={isMerchant}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <DeliveryTable
        deliveries={deliveries}
        loading={loading}
        selectedRowKeys={selectedRowKeys}
        onRowSelect={setSelectedRowKeys}
        onEdit={handleEditClick}
        onViewHistory={handleViewHistory}
        expandedRowKeys={expandedRowKeys}
        expandedItems={expandedItems}
        loadingRows={loadingRows}
        onExpand={handleExpand}
        isMerchant={isMerchant}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Нийт: {pagination.total} | Хуудас: {pagination.current} /{' '}
          {Math.ceil(pagination.total / pagination.pageSize)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({ ...prev, current: Math.max(1, prev.current - 1) }))
            }
            disabled={pagination.current === 1}
          >
            Өмнөх
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current: Math.min(
                  Math.ceil(pagination.total / pagination.pageSize),
                  prev.current + 1
                ),
              }))
            }
            disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
          >
            Дараах
          </Button>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) =>
              setPagination((prev) => ({ ...prev, pageSize: parseInt(value), current: 1 }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      {hasPermission('delivery:excel_import_delivery') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="text-sm text-gray-600">
              {selectedRowKeys.length} ширхэг сонгогдсон
              {selectedRowKeys.length > 0 && (
                <span className="ml-4 font-semibold">
                  Нийт: {deliveries
                    .filter((d) => selectedRowKeys.includes(d.id))
                    .reduce((sum, d) => sum + (Number(d.price) || 0), 0)
                    .toLocaleString()}₮
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAllocateToDriver}
                disabled={selectedRowKeys.length === 0}
              >
                Жолоочод хуваарилах
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={selectedRowKeys.length === 0}
              >
                Устгах
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={selectedRowKeys.length === 0}
              >
                Төлөв солих
              </Button>
              <Button
                onClick={handleDeliveryDateChange}
                disabled={selectedRowKeys.length === 0}
              >
                Хүргэх огноо тохируулах
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={selectedRowKeys.length === 0}
              >
                Хэвлэх
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={selectedRowKeys.length === 0}
              >
                Excel Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <DeliveryForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateDelivery}
        merchants={merchants}
        districts={DISTRICTS}
        isMerchant={isMerchant}
        merchantId={merchantId || undefined}
        username={username || undefined}
        products={products}
        pullFromWarehouse={pullFromWarehouse}
        onPullFromWarehouseChange={setPullFromWarehouse}
        onProductsFetch={handleProductsFetch}
      />

      {/* Modals */}
      <DriverAllocationModal
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
          setSelectedDriverId(null);
          setSelectedRegionId(null);
        }}
        onSave={handleSaveAllocation}
        drivers={drivers}
        selectedDriverId={selectedDriverId}
        onDriverSelect={setSelectedDriverId}
        regions={regions}
        selectedRegionId={selectedRegionId}
        onRegionSelect={setSelectedRegionId}
      />

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedStatusId(null);
        }}
        onSave={handleSaveStatusChange}
        statuses={statusList}
        selectedStatusId={selectedStatusId}
        onStatusSelect={setSelectedStatusId}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={deliveryHistory}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDelivery(null);
        }}
        onSave={handleEdit}
        delivery={selectedDelivery}
        formData={editFormData}
        onFormDataChange={setEditFormData}
      />

      <DeliveryDateModal
        isOpen={isDeliveryDateModalOpen}
        onClose={() => {
          setIsDeliveryDateModalOpen(false);
          setBulkDeliveryDate('');
        }}
        onSave={handleSaveDeliveryDate}
        deliveryDate={bulkDeliveryDate}
        onDeliveryDateChange={setBulkDeliveryDate}
      />
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={<div className="w-full mt-6 px-4 pb-32">Ачааллаж байна...</div>}>
      <DeliveryPageContent />
    </Suspense>
  );
}

