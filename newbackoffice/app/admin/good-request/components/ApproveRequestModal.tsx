"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoodRequest } from '../types/good-request';

interface ApproveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (stock: number) => Promise<void>;
  request: GoodRequest | null;
}

export default function ApproveRequestModal({
  isOpen,
  onClose,
  onApprove,
  request,
}: ApproveRequestModalProps) {
  const [stock, setStock] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update stock when request changes
  useEffect(() => {
    if (request) {
      setStock(request.stock.toString());
    }
  }, [request]);

  const handleApprove = async () => {
    const stockValue = parseFloat(stock);
    
    if (isNaN(stockValue) || stockValue <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(stockValue);
      onClose();
      setStock('');
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      if (request) {
        setStock(request.stock.toString());
      }
    }
  };

  if (!request) return null;

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'Шинэ бараа үүсгэх';
      case 2:
        return 'Нэмэх';
      case 3:
        return 'Хасах';
      default:
        return 'Тодорхойгүй';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Хүсэлт зөвшөөрөх</DialogTitle>
          <DialogDescription>
            Та энэ хүсэлтийг зөвшөөрөхдөө тоо ширхэгийг засах боломжтой.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Төрөл</Label>
            <p className="text-sm font-semibold">{getTypeLabel(request.type)}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Бараа</Label>
            <p className="text-sm font-semibold">
              {request.good?.name || request.name || 'Тодорхойгүй'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Агуулах</Label>
            <p className="text-sm font-semibold">{request.ware?.name || 'Тодорхойгүй'}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock" className="text-sm font-medium">
              Тоо ширхэг <span className="text-gray-500">(анхны: {request.stock})</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min="1"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Тоо ширхэг оруулна уу"
              disabled={isSubmitting}
              className="w-full"
            />
            {stock && (isNaN(parseFloat(stock)) || parseFloat(stock) <= 0) && (
              <p className="text-sm text-red-500">Тоо ширхэг 0-ээс их байх ёстой</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Цуцлах
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting || !stock || isNaN(parseFloat(stock)) || parseFloat(stock) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? 'Зөвшөөрөж байна...' : 'Зөвшөөрөх'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

