"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Good, GoodHistory } from '../types/good';
import { fetchGoodHistory } from '../services/good.service';

interface GoodHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  good: Good | null;
}

const getTypeLabel = (type: number): string => {
  switch (type) {
    case 1:
      return 'Админ орлого';
    case 2:
      return 'Админ зарлага';
    case 3:
      return 'Хүргэлт үүсгэсэн';
    case 4:
      return 'Жолооч цуцалсан';
    case 5:
      return 'Хүргэлт амжилттай';
    default:
      return 'Тодорхойгүй';
  }
};

const getTypeColor = (type: number): string => {
  switch (type) {
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-red-100 text-red-800';
    case 3:
      return 'bg-blue-100 text-blue-800';
    case 4:
      return 'bg-yellow-100 text-yellow-800';
    case 5:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function GoodHistoryModal({
  isOpen,
  onClose,
  good,
}: GoodHistoryModalProps) {
  const [histories, setHistories] = useState<GoodHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && good) {
      loadHistory();
    } else {
      setHistories([]);
    }
  }, [isOpen, good]);

  const loadHistory = async () => {
    if (!good) return;
    setLoading(true);
    try {
      const data = await fetchGoodHistory(good.id);
      setHistories(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {good?.name} - Түүх
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Түүх олдсонгүй
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Төрөл</TableHead>
                    <TableHead>Тоо хэмжээ</TableHead>
                    <TableHead>Хүргэлт ID</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Тайлбар</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histories.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="text-sm">
                        {formatDate(history.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(history.type)}>
                          {getTypeLabel(history.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {history.amount}
                      </TableCell>
                      <TableCell>
                        {history.delivery?.delivery_id || '-'}
                      </TableCell>
                      <TableCell>
                        {history.user?.username || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {history.comment || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

