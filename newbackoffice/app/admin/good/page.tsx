"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import GoodTable from './components/GoodTable';
import GoodForm from './components/GoodForm';
import { StockUpdateModal } from './components/GoodModals';
import { GoodHistoryModal } from './components/GoodHistoryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState<string>('');

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
  const isMerchant = user ? (user?.role === 2 || user?.role_id === 2) : false;
  const merchantId = isMerchant ? (user?.id || user?.user_id || null) : null;

  // Load initial data
  useEffect(() => {
    document.title = 'Агуулахын бараа';

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedUsername =
      typeof window !== 'undefined' ? localStorage.getItem('username') : null;

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    if (storedUsername) setUsername(storedUsername);
  }, []);

  // Load data after user is set
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const loadData = async () => {
      setLoading(true);
      try {
        const currentIsMerchant = user?.role === 2 || user?.role_id === 2;
        const currentMerchantId = currentIsMerchant ? (user?.id || user?.user_id || null) : null;

        const [goodsData, merchantsData, waresData] = await Promise.all([
          fetchGoods(currentIsMerchant ? currentMerchantId : undefined).catch(() => []),
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
  }, [user]);

  // Filter goods by merchant and search term
  useEffect(() => {
    let filtered = goods;

    // Filter by merchant
    if (merchantFilter) {
      filtered = filtered.filter((good) => good.merchant.id === merchantFilter);
    }

    // Filter by search term (good name)
    if (searchTerm.trim()) {
      filtered = filtered.filter((good) =>
        good.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    setFilteredGoods(filtered);
  }, [merchantFilter, searchTerm, goods]);

  // Handlers
  const handleCreateGood = async (payload: any) => {
    try {
      const newGood = await createGood(payload);
      setGoods((prev) => [...prev, newGood]);
      // The filteredGoods will be updated automatically by the useEffect
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
        {!isMerchant && (
          <Button onClick={() => setIsDrawerOpen(true)}>+ Бараа үүсгэх</Button>
        )}
      </div>

      {!isMerchant && (
        <div className="mb-4 flex items-center gap-4">
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
          <Input
            type="text"
            placeholder="Барааны нэрээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      )}
      {isMerchant && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Барааны нэрээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
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

