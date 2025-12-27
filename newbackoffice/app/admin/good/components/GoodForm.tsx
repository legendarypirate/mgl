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
import { Merchant, Ware } from '../types/good';

interface GoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  merchants: Merchant[];
  wares: Ware[];
  isMerchant?: boolean;
  merchantId?: number;
  username?: string;
}

export default function GoodForm({
  isOpen,
  onClose,
  onSubmit,
  merchants,
  wares,
  isMerchant = false,
  merchantId,
  username,
}: GoodFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    merchant_id: merchantId?.toString() || '',
    ware_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        stock: '',
        merchant_id: merchantId?.toString() || '',
        ware_id: '',
      });
    }
  }, [isOpen, merchantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        stock: Number(formData.stock),
        merchant_id: isMerchant ? merchantId : parseInt(formData.merchant_id),
        ware_id: parseInt(formData.ware_id),
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
        <h2 className="text-xl font-semibold">Бараа үүсгэх</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ×
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Барааны нэр *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Барааны нэр"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Үлдэгдэл *</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={formData.stock}
            onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="Үлдэгдэл"
            required
          />
        </div>

        {isMerchant ? (
          <>
            <div className="space-y-2">
              <Label>Дэлгүүр</Label>
              <div className="p-2 border rounded bg-gray-50">{username}</div>
            </div>
            <input type="hidden" name="merchant_id" value={merchantId} />
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="merchant_id">Дэлгүүр *</Label>
            <Select
              value={formData.merchant_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, merchant_id: value }))}
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
          <Label htmlFor="ware_id">Агуулах *</Label>
          <Select
            value={formData.ware_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, ware_id: value }))}
            required
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
      </form>
    </div>
  );
}

