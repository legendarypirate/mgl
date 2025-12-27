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
import { User } from '../types/order';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  merchants: User[];
  isMerchant?: boolean;
  merchantId?: number;
  username?: string;
}

export default function OrderForm({
  isOpen,
  onClose,
  onSubmit,
  merchants,
  isMerchant = false,
  merchantId,
  username,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    merchantId: merchantId?.toString() || '',
    phone: '',
    address: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        merchantId: merchantId?.toString() || '',
        phone: '',
        address: '',
        comment: '',
      });
    }
  }, [isOpen, merchantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        merchant_id: isMerchant ? merchantId : parseInt(formData.merchantId),
        phone: formData.phone,
        address: formData.address,
        status: 1, // Default status
        comment: formData.comment,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
        <h2 className="text-xl font-semibold">Захиалга үүсгэх</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ×
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {isMerchant ? (
          <>
            <div className="space-y-2">
              <Label>Дэлгүүрийн нэр</Label>
              <div className="p-2 border rounded bg-gray-50">{username}</div>
            </div>
            <input type="hidden" name="merchant_id" value={merchantId} />
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="merchantId">Дэлгүүрийн нэр *</Label>
            <Select
              value={formData.merchantId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, merchantId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Дэлгүүр сонгох" />
              </SelectTrigger>
              <SelectContent>
                {merchants.map((merchant) => (
                  <SelectItem key={merchant.id} value={merchant.id.toString()}>
                    {merchant.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Утас *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Утасны дугаар"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Хаяг *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Хаяг"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Тайлбар *</Label>
          <Input
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="Тайлбар"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Хадгалж байна...' : 'Үүсгэх'}
        </Button>
      </form>
    </div>
  );
}

