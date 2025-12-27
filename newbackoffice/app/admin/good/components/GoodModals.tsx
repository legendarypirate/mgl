"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Good } from '../types/good';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: number; amount: number }) => Promise<void>;
  good: Good | null;
}

export function StockUpdateModal({
  isOpen,
  onClose,
  onSave,
  good,
}: StockUpdateModalProps) {
  const [formData, setFormData] = useState({ type: '', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ type: '', amount: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !formData.type || !formData.amount) return;

    setIsSubmitting(true);
    try {
      await onSave({
        type: parseInt(formData.type),
        amount: Number(formData.amount),
      });
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Орлого эсвэл Зарлага</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Бараа:</strong> {good?.name}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Төрөл *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Орлого</SelectItem>
                  <SelectItem value="2">Зарлага</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Тоо хэмжээ *</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Тоо хэмжээ"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Цуцлах
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

