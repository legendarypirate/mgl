"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import WarehouseTable from './components/WarehouseTable';
import WarehouseForm from './components/WarehouseForm';
import { Button } from '@/components/ui/button';
import { Warehouse } from './types/warehouse';
import {
  fetchWarehouses,
  createWarehouse,
  deleteWarehouse,
} from './services/warehouse.service';

export default function WarehousePage() {
  // State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    document.title = 'Агуулах';

    const loadData = async () => {
      setLoading(true);
      try {
        const warehousesData = await fetchWarehouses();
        setWarehouses(warehousesData);
      } catch (error: any) {
        console.error('Error loading initial data:', error);
        toast.error('Өгөгдөл ачааллахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers
  const handleCreateWarehouse = async (payload: { name: string }) => {
    try {
      const newWarehouse = await createWarehouse(payload);
      setWarehouses((prev) => [...prev, newWarehouse]);
      toast.success('Агуулах амжилттай үүсгэгдлээ');
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Агуулах үүсгэхэд алдаа гарлаа');
    }
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    if (!confirm(`Та "${warehouse.name}" агуулхыг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    const deleteWarehouseAsync = async () => {
      try {
        await deleteWarehouse(warehouse.id);
        setWarehouses((prev) => prev.filter((w) => w.id !== warehouse.id));
        toast.success(`"${warehouse.name}" агуулах амжилттай устгагдлаа`);
      } catch (error: any) {
        toast.error(error.message || 'Устгахад алдаа гарлаа');
      }
    };

    deleteWarehouseAsync();
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Агуулах</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>+ Агуулах үүсгэх</Button>
      </div>

      <WarehouseTable
        warehouses={warehouses}
        loading={loading}
        onDelete={handleDeleteWarehouse}
      />

      {/* Drawer */}
      <WarehouseForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateWarehouse}
      />
    </div>
  );
}

