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
  fetchMerchants,
  fetchDrivers,
  fetchStatuses,
  fetchProducts,
  importDeliveries,
  fetchRegions,
} from './services/delivery.service';
import { useSearchParams } from 'next/navigation';

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

  // State
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  // Filters
  const [phoneFilter, setPhoneFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<number | null>(null);
  const [driverFilter, setDriverFilter] = useState<number | null>(null);
  const [districtFilter, setDistrictFilter] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>(initialStatusIds);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pullFromWarehouse, setPullFromWarehouse] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);

  // Modals
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistory[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [editFormData, setEditFormData] = useState({ phone: '', address: '', price: '' });

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
          startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
          endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
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
    // Refresh deliveries
    const filters: Filters = {
      phone: phoneFilter || undefined,
      merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
      driverId: driverFilter || undefined,
      districtId: districtFilter || undefined,
      statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
      endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
    };
    const result = await fetchDeliveries(filters, pagination);
    setDeliveries(result.data);
    setPagination((prev) => ({ ...prev, total: result.pagination.total }));
  };

  const handleEdit = async () => {
    if (!selectedDelivery) return;
    try {
      await updateDelivery(selectedDelivery.id, {
        phone: editFormData.phone,
        address: editFormData.address,
        price: Number(editFormData.price),
      });
      toast.success('Амжилттай шинэчлэгдлээ');
      setIsEditModalOpen(false);
      // Refresh deliveries
      const filters: Filters = {
        phone: phoneFilter || undefined,
        merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
        driverId: driverFilter || undefined,
        districtId: districtFilter || undefined,
        statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
      };
      const result = await fetchDeliveries(filters, pagination);
      setDeliveries(result.data);
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
      // Refresh deliveries
      const filters: Filters = {
        phone: phoneFilter || undefined,
        merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
        driverId: driverFilter || undefined,
        districtId: districtFilter || undefined,
        statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
      };
      const result = await fetchDeliveries(filters, pagination);
      setDeliveries(result.data);
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
      // Refresh deliveries
      const filters: Filters = {
        phone: phoneFilter || undefined,
        merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
        driverId: driverFilter || undefined,
        districtId: districtFilter || undefined,
        statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
      };
      const result = await fetchDeliveries(filters, pagination);
      setDeliveries(result.data);
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
      // Refresh deliveries
      const filters: Filters = {
        phone: phoneFilter || undefined,
        merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
        driverId: driverFilter || undefined,
        districtId: districtFilter || undefined,
        statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
      };
      const result = await fetchDeliveries(filters, pagination);
      setDeliveries(result.data);
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
    setEditFormData({
      phone: delivery.phone,
      address: delivery.address,
      price: delivery.price.toString(),
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
        // Refresh deliveries
        const filters: Filters = {
          phone: phoneFilter || undefined,
          merchantId: merchantFilter || (isMerchant ? merchantId : undefined),
          driverId: driverFilter || undefined,
          districtId: districtFilter || undefined,
          statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
          endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
        };
        const result2 = await fetchDeliveries(filters, pagination);
        setDeliveries(result2.data);
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
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .logo { max-width: 200px; height: auto; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9px; }
                th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                @page { size: A4 portrait; margin: 10mm; }
              </style>
            </head>
            <body>
              <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                  <img src="/uguujlogo.png" alt="Logo" class="logo" onerror="this.style.display='none'">
                </div>
                ${uniqueDrivers ? `<div style="flex: 1; text-align: right;"><div style="font-weight: bold;">Жолооч:</div><div>${uniqueDrivers}</div></div>` : ''}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Дэлгүүр</th>
                    <th>Хаяг</th>
                    <th>Утас</th>
                    <th>Үнэ</th>
                    <th>Бараа</th>
                    <th>Тайлбар</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsWithItems
                    .map(
                      (row) => `
                    <tr>
                      <td>${row.merchant?.username ?? '-'}</td>
                      <td>${row.address}</td>
                      <td>${row.phone}</td>
                      <td>${row.price?.toLocaleString() ?? '0'}₮</td>
                      <td>${row.items && row.items.length > 0 ? row.items.map((item: any) => `${item.good?.name || 'Unknown'} (${item.quantity})`).join(', ') : 'Бараа байхгүй'}</td>
                      <td>${row.comment ?? '-'}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <div style="margin-top: 20px; text-align: right; font-size: 10px;">
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

  const handleExportExcel = () => {
    const selectedRows = deliveries.filter((item) => selectedRowKeys.includes(item.id));
    const excelData = selectedRows.map((row) => ({
      Дэлгүүр: row.merchant?.username ?? '-',
      Хаяг: row.address,
      Утас: row.phone,
      Үнэ: row.price,
      Тайлбар: row.comment ?? '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Deliveries');
    XLSX.writeFile(workbook, 'selected_deliveries.xlsx');
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

