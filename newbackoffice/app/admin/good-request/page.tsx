"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import GoodRequestTable from './components/GoodRequestTable';
import GoodRequestForm from './components/GoodRequestForm';
import ApproveRequestModal from './components/ApproveRequestModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GoodRequest } from './types/good-request';
import { Good, Ware } from '../good/types/good';
import {
  fetchGoodRequests,
  createGoodRequest,
  approveRequest,
  declineRequest,
  fetchGoods,
  fetchWares,
} from './services/good-request.service';

export default function GoodRequestPage() {
  // State
  const [requests, setRequests] = useState<GoodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GoodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GoodRequest | null>(null);

  // Data
  const [goods, setGoods] = useState<Good[]>([]);
  const [wares, setWares] = useState<Ware[]>([]);

  // User info
  const [user, setUser] = useState<any>(null);
  const isMerchant = user ? (user?.role === 2 || user?.role_id === 2) : false;
  const merchantId = isMerchant ? (user?.id || user?.user_id || null) : null;

  // Load initial data
  useEffect(() => {
    document.title = 'Барааны хүсэлт';

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    const userIsMerchant = user?.role === 2 || user?.role_id === 2;
    const userMerchantId = userIsMerchant ? (user?.id || user?.user_id || null) : null;
    
    setLoading(true);
    try {
      const [requestsData, goodsData, waresData] = await Promise.all([
        fetchGoodRequests(userIsMerchant ? userMerchantId : undefined).catch(() => []),
        userIsMerchant && userMerchantId ? fetchGoods(userMerchantId).catch(() => []) : Promise.resolve([]),
        fetchWares().catch(() => []),
      ]);

      setRequests(requestsData);
      setFilteredRequests(requestsData);
      setGoods(goodsData);
      setWares(waresData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Өгөгдөл ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests by status, type, and search term
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== null) {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== null) {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    // Filter by search term (good name or merchant name)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((request) => {
        const goodName = request.good?.name || request.name || '';
        const merchantName = request.merchant?.username || '';
        return (
          goodName.toLowerCase().includes(searchLower) ||
          merchantName.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredRequests(filtered);
  }, [statusFilter, typeFilter, searchTerm, requests]);

  // Handlers
  const handleCreateRequest = async (payload: any) => {
    try {
      await createGoodRequest(payload);
      toast.success('Хүсэлт амжилттай үүсгэгдлээ');
      setIsDrawerOpen(false);
      loadData(); // Reload requests
    } catch (error: any) {
      toast.error(error.message || 'Хүсэлт үүсгэхэд алдаа гарлаа');
    }
  };

  const handleApprove = (request: GoodRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async (stock: number) => {
    if (!selectedRequest) return;

    try {
      await approveRequest(selectedRequest.id, stock);
      toast.success('Хүсэлт амжилттай зөвшөөрөгдлөө');
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      loadData(); // Reload requests
    } catch (error: any) {
      toast.error(error.message || 'Зөвшөөрөхөд алдаа гарлаа');
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleDecline = async (request: GoodRequest) => {
    if (!confirm(`Та энэ хүсэлтийг татгалзахдаа итгэлтэй байна уу?`)) {
      return;
    }

    try {
      await declineRequest(request.id);
      toast.success('Хүсэлт амжилттай татгалзсан');
      loadData(); // Reload requests
    } catch (error: any) {
      toast.error(error.message || 'Татгалзахдаа алдаа гарлаа');
    }
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Барааны хүсэлт</h1>
        {isMerchant && (
          <Button onClick={() => setIsDrawerOpen(true)}>+ Хүсэлт үүсгэх</Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {!isMerchant && (
          <Select
            value={statusFilter?.toString() || 'all'}
            onValueChange={(value) => setStatusFilter(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Төлөвөөр шүүх" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              <SelectItem value="1">Хүлээгдэж байна</SelectItem>
              <SelectItem value="2">Зөвшөөрөгдсөн</SelectItem>
              <SelectItem value="3">Татгалзсан</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select
          value={typeFilter?.toString() || 'all'}
          onValueChange={(value) => setTypeFilter(value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Төрлөөр шүүх" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх төрөл</SelectItem>
            <SelectItem value="1">Шинэ бараа үүсгэх</SelectItem>
            <SelectItem value="2">Нэмэх</SelectItem>
            <SelectItem value="3">Хасах</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Бараа эсвэл дэлгүүрийн нэрээр хайх..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      <GoodRequestTable
        requests={filteredRequests}
        loading={loading}
        onApprove={!isMerchant ? handleApprove : undefined}
        onDecline={!isMerchant ? handleDecline : undefined}
        isMerchant={isMerchant}
      />

      {/* Create Request Drawer (only for merchants) */}
      {isMerchant && merchantId && (
        <GoodRequestForm
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleCreateRequest}
          goods={goods}
          wares={wares}
          merchantId={merchantId}
        />
      )}

      {/* Approve Request Modal (only for admin) */}
      {!isMerchant && (
        <ApproveRequestModal
          isOpen={isApproveModalOpen}
          onClose={() => {
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApproveConfirm}
          request={selectedRequest}
        />
      )}
    </div>
  );
}

