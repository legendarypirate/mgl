"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import GoodTable from './components/GoodTable';
import GoodForm from './components/GoodForm';
import { StockUpdateModal } from './components/GoodModals';
import { GoodHistoryModal } from './components/GoodHistoryModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Good, Merchant, Ware } from './types/good';
import {
  fetchGoods,
  fetchMerchants,
  fetchWares,
  createGood,
  deleteGood,
  updateStock,
} from './services/good.service';

export default function GoodPage() {
  // State
  const [goods, setGoods] = useState<Good[]>([]);
  const [filteredGoods, setFilteredGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(false);
  const [merchantFilter, setMerchantFilter] = useState<number | null>(null);

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState<Good | null>(null);

  // Data
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [wares, setWares] = useState<Ware[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const isMerchant = user?.role === 2;
  const merchantId = isMerchant ? user?.id : null;

  // Load initial data
  useEffect(() => {
    document.title = 'Агуулахын бараа';

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedUsername =
      typeof window !== 'undefined' ? localStorage.getItem('username') : null;

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedUsername) setUsername(storedUsername);

    const loadData = async () => {
      setLoading(true);
      try {
        const [goodsData, merchantsData, waresData] = await Promise.all([
          fetchGoods(isMerchant ? merchantId : undefined).catch(() => []),
          fetchMerchants().catch(() => []),
          fetchWares().catch(() => []),
        ]);

        setGoods(goodsData);
        setFilteredGoods(goodsData);
        setMerchants(merchantsData);
        setWares(waresData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Өгөгдөл ачааллахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isMerchant, merchantId]);

  // Filter goods by merchant
  useEffect(() => {
    if (merchantFilter) {
      setFilteredGoods(goods.filter((good) => good.merchant.id === merchantFilter));
    } else {
      setFilteredGoods(goods);
    }
  }, [merchantFilter, goods]);

  // Handlers
  const handleCreateGood = async (payload: any) => {
    try {
      const newGood = await createGood(payload);
      setGoods((prev) => [...prev, newGood]);
      if (!merchantFilter || newGood.merchant.id === merchantFilter) {
        setFilteredGoods((prev) => [...prev, newGood]);
      }
      toast.success('Бараа амжилттай үүсгэгдлээ');
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Бараа үүсгэхэд алдаа гарлаа');
    }
  };

  const handleDeleteGood = (good: Good) => {
    if (!confirm(`Та "${good.name}" барааг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    const deleteGoodAsync = async () => {
      try {
        await deleteGood(good.id);
        setGoods((prev) => prev.filter((g) => g.id !== good.id));
        setFilteredGoods((prev) => prev.filter((g) => g.id !== good.id));
        toast.success(`"${good.name}" бараа амжилттай устгагдлаа`);
      } catch (error: any) {
        toast.error(error.message || 'Устгахад алдаа гарлаа');
      }
    };

    deleteGoodAsync();
  };

  const handleEditClick = (good: Good) => {
    setSelectedGood(good);
    setIsStockModalOpen(true);
  };

  const handleHistoryClick = (good: Good) => {
    setSelectedGood(good);
    setIsHistoryModalOpen(true);
  };

  const handleStockUpdate = async (values: { type: number; amount: number }) => {
    if (!selectedGood) return;

    try {
      const updatedGood = await updateStock({
        id: selectedGood.id,
        type: values.type,
        amount: values.amount,
      });

      setGoods((prev) =>
        prev.map((good) =>
          good.id === selectedGood.id
            ? {
                ...good,
                stock: updatedGood.stock,
                in_delivery: updatedGood.in_delivery,
                delivered: updatedGood.delivered,
              }
            : good
        )
      );
      setFilteredGoods((prev) =>
        prev.map((good) =>
          good.id === selectedGood.id
            ? {
                ...good,
                stock: updatedGood.stock,
                in_delivery: updatedGood.in_delivery,
                delivered: updatedGood.delivered,
              }
            : good
        )
      );
      setIsStockModalOpen(false);
      setSelectedGood(null);

      if (values.type === 1) {
        toast.success('Амжилттай орлогодолоо');
      } else if (values.type === 2) {
        toast.warning('Амжилттай зарлагадлаа');
      }
    } catch (error: any) {
      toast.error(error.message || 'Үлдэгдэл шинэчлэхэд алдаа гарлаа');
    }
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Агуулахын бараа</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>+ Бараа үүсгэх</Button>
      </div>

      {!isMerchant && (
        <div className="mb-4">
          <Select
            value={merchantFilter?.toString() || 'all'}
            onValueChange={(value) => setMerchantFilter(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Дэлгүүрээр шүүх" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүгд</SelectItem>
              {merchants.map((merchant) => (
                <SelectItem key={merchant.id} value={merchant.id.toString()}>
                  {merchant.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <GoodTable
        goods={filteredGoods}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteGood}
        onHistory={handleHistoryClick}
        isMerchant={isMerchant}
      />

      {/* Drawer */}
      <GoodForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateGood}
        merchants={merchants}
        wares={wares}
        isMerchant={isMerchant}
        merchantId={merchantId || undefined}
        username={username || undefined}
      />

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedGood(null);
        }}
        onSave={handleStockUpdate}
        good={selectedGood}
      />

      {/* History Modal */}
      <GoodHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedGood(null);
        }}
        good={selectedGood}
      />
    </div>
  );
}

