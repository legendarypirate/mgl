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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '../types/request';

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phone: string) => Promise<void>;
  user: User | null;
}

export function EditPhoneModal({
  isOpen,
  onClose,
  onSave,
  user,
}: EditPhoneModalProps) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setPhone(user.phone || '');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !phone) return;

    setIsSubmitting(true);
    try {
      await onSave(phone);
      onClose();
    } catch (error) {
      console.error('Error updating phone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Утасны дугаар засах - {user?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Утасны дугаар *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Утасны дугаар"
              pattern="[0-9+\-\s()]+"
              required
            />
            <p className="text-xs text-gray-500">
              Зөвхөн утасны дугаар засах боломжтой
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Болих
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

