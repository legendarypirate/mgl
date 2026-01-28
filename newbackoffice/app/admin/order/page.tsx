"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import OrderTable from './components/OrderTable';
import OrderFilters from './components/OrderFilters';
import OrderForm from './components/OrderForm';
import { DriverAllocationModal } from './components/OrderModals';
import { Button } from '@/components/ui/button';
import {
  Order,
  OrderStatus,
  User,
  OrderFilters as Filters,
} from './types/order';
import {
  fetchOrders,
  createOrder,
  allocateOrders,
  fetchMerchants,
  fetchDrivers,
  deleteOrder,
} from './services/order.service';

export default function OrderPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [phoneFilter, setPhoneFilter] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Pagination
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  // Data
  const [merchants, setMerchants] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [statusList, setStatusList] = useState<OrderStatus[]>([
    { id: 1, label: 'Шинэ', color: 'orange' },
    { id: 2, label: 'Жолоочид', color: 'blue' },
    { id: 3, label: 'Хүргэсэн', color: 'green' },
    { id: 4, label: 'Цуцалсан', color: 'red' },
  ]);

  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const isMerchant = user?.role === 2;
  const merchantId = isMerchant ? user?.id : null;

  // Permissions
  const [permissions, setPermissions] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    document.title = 'Татан авалт';

    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const parsedUser = userData ? JSON.parse(userData) : null;
    setUser(parsedUser);

    const usernameData = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    setUsername(usernameData);

    const saved = localStorage.getItem('permissions');
    if (saved) setPermissions(JSON.parse(saved));
  }, []);

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters: Filters = {
        phone: phoneFilter || undefined,
        statusIds: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        startDate: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : undefined,
        endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : undefined,
      };

      const result = await fetchOrders(filters, pagination, merchantId || undefined);
      setOrders(result.data);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Захиалга ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  // Load merchants when user is loaded (only for non-merchants)
  useEffect(() => {
    if (user !== null && user?.role !== 2) {
      const loadMerchants = async () => {
        try {
          const merchantsData = await fetchMerchants();
          setMerchants(merchantsData);
        } catch (error) {
          console.error('Error loading merchants:', error);
        }
      };
      loadMerchants();
    }
  }, [user]);

  // Reload when filters or pagination changes
  useEffect(() => {
    if (user !== null) {
      // Only load orders after user data is loaded
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneFilter, selectedStatuses, dateRange, pagination.current, pagination.pageSize, merchantId, user]);

  // Handle create order
  const handleCreateOrder = async (data: any) => {
    try {
      await createOrder(data);
      toast.success('Захиалга амжилттай үүслээ');
      await loadOrders();
      setIsDrawerOpen(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Захиалга үүсгэхэд алдаа гарлаа');
    }
  };

  // Handle allocate to driver
  const handleAllocateToDriver = async () => {
    if (selectedRowKeys.length === 0) {
      toast.error('Хамгийн багадаа нэг захиалга сонгоно уу');
      return;
    }

    try {
      const driversData = await fetchDrivers();
      setDrivers(driversData);
      setIsDriverModalOpen(true);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Жолооч ачааллахад алдаа гарлаа');
    }
  };

  const handleSaveAllocation = async () => {
    if (!selectedDriverId) {
      toast.error('Жолооч сонгоно уу');
      return;
    }

    try {
      await allocateOrders({
        driver_id: selectedDriverId,
        delivery_ids: selectedRowKeys.map(key => 
          typeof key === 'bigint' ? Number(key) : key
        ) as (string | number)[],
      });
      toast.success('Захиалга жолоочод амжилттай хуваарилагдлаа');
      setIsDriverModalOpen(false);
      setSelectedDriverId(null);
      setSelectedRowKeys([]);
      await loadOrders();
    } catch (error: any) {
      console.error('Error allocating orders:', error);
      toast.error(error.message || 'Захиалга хуваарилахад алдаа гарлаа');
    }
  };

  const toggleStatus = (id: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const hasPermission = (perm: string) => permissions.includes(perm);

  // Handle delete order
  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Та энэ захиалгыг устгахдаа итгэлтэй байна уу?')) {
      return;
    }

    try {
      await deleteOrder(id);
      toast.success('Захиалга амжилттай устгалаа');
      await loadOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'Захиалга устгахад алдаа гарлаа');
    }
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Татан авалт</h1>
      </div>

      <OrderFilters
        phoneFilter={phoneFilter}
        onPhoneFilterChange={setPhoneFilter}
        statusList={statusList}
        selectedStatuses={selectedStatuses}
        onStatusToggle={toggleStatus}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onAddOrder={() => setIsDrawerOpen(true)}
        hasPermission={hasPermission}
      />

      <OrderTable
        orders={orders}
        loading={loading}
        selectedRowKeys={selectedRowKeys}
        onRowSelect={setSelectedRowKeys}
        statusList={statusList}
        isMerchant={isMerchant}
        onDelete={handleDeleteOrder}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedRowKeys.length} захиалга сонгогдлоо
        </div>
        <div className="flex gap-2">
          {hasPermission('order:allocate_order') && (
            <Button
              onClick={handleAllocateToDriver}
              disabled={selectedRowKeys.length === 0}
            >
              Жолоочод хуваарилах
            </Button>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setPagination((prev) => ({ ...prev, current: prev.current - 1 }))
          }
          disabled={pagination.current === 1}
        >
          Өмнөх
        </Button>
        <span className="flex items-center px-4">
          {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <Button
          variant="outline"
          onClick={() =>
            setPagination((prev) => ({ ...prev, current: prev.current + 1 }))
          }
          disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
        >
          Дараах
        </Button>
      </div>

      {/* Drawer */}
      <OrderForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateOrder}
        merchants={merchants}
        isMerchant={isMerchant}
        merchantId={merchantId || undefined}
        username={username || undefined}
      />

      {/* Driver Allocation Modal */}
      <DriverAllocationModal
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
          setSelectedDriverId(null);
        }}
        onSave={handleSaveAllocation}
        drivers={drivers}
        selectedDriverId={selectedDriverId}
        onDriverSelect={setSelectedDriverId}
      />
    </div>
  );
}

