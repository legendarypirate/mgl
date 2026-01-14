"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Good, Ware } from '../../good/types/good';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface GoodRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  goods: Good[];
  wares: Ware[];
  merchantId: number;
  wareId?: number;
}

export default function GoodRequestForm({
  isOpen,
  onClose,
  onSubmit,
  goods,
  wares,
  merchantId,
  wareId,
}: GoodRequestFormProps) {
  const [formData, setFormData] = useState({
    type: '2', // 2 = add only (deduct removed)
    good_id: '',
    ware_id: wareId?.toString() || '',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredGoods, setFilteredGoods] = useState<Good[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: '2',
        good_id: '',
        ware_id: wareId?.toString() || '',
        amount: '',
      });
    }
  }, [isOpen, wareId]);

  // Filter goods by selected warehouse
  useEffect(() => {
    if (formData.ware_id) {
      const filtered = goods.filter(
        (good) => good.ware?.id === parseInt(formData.ware_id)
      );
      setFilteredGoods(filtered);
    } else {
      setFilteredGoods(goods);
    }
  }, [formData.ware_id, goods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.good_id || !formData.ware_id || !formData.amount) {
      alert('Бүх талбарыг бөглөнө үү');
      return;
    }

    const amount = parseInt(formData.amount);
    if (amount <= 0) {
      alert('Тоо ширхэг 0-ээс их байх ёстой');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedGood = goods.find((g) => g.id === parseInt(formData.good_id));
      if (!selectedGood) {
        throw new Error('Бараа олдсонгүй');
      }

      const payload = {
        type: parseInt(formData.type), // 2 = add only
        good_id: parseInt(formData.good_id),
        ware_id: parseInt(formData.ware_id),
        merchant_id: merchantId,
        amount: amount,
      };

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Барааны хүсэлт үүсгэх</SheetTitle>
          <SheetDescription>
            Барааны нэмэх хүсэлт үүсгэнэ үү
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div className="space-y-2">
            <Label htmlFor="ware_id">Агуулах</Label>
            <Select
              value={formData.ware_id}
              onValueChange={(value) => setFormData({ ...formData, ware_id: value, good_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Агуулах сонгох" />
              </SelectTrigger>
              <SelectContent>
                {wares.map((ware) => (
                  <SelectItem key={ware.id} value={ware.id.toString()}>
                    {ware.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="good_id">Бараа</Label>
            <Select
              value={formData.good_id}
              onValueChange={(value) => setFormData({ ...formData, good_id: value })}
              disabled={!formData.ware_id || filteredGoods.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Бараа сонгох" />
              </SelectTrigger>
              <SelectContent>
                {filteredGoods.map((good) => (
                  <SelectItem key={good.id} value={good.id.toString()}>
                    {good.name} (Үлдэгдэл: {good.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.ware_id && filteredGoods.length === 0 && (
              <p className="text-sm text-gray-500">Энэ агуулахад бараа байхгүй байна</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Тоо ширхэг</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Тоо ширхэг оруулах"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Хадгалж байна...' : 'Хүсэлт үүсгэх'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Цуцлах
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

