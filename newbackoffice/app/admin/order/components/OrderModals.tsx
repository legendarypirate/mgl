"use client";

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
import { User } from '../types/order';

interface DriverAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  drivers: User[];
  selectedDriverId: number | null;
  onDriverSelect: (driverId: number) => void;
}

export function DriverAllocationModal({
  isOpen,
  onClose,
  onSave,
  drivers,
  selectedDriverId,
  onDriverSelect,
}: DriverAllocationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Жолооч сонгох</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedDriverId?.toString() || ''}
            onValueChange={(value) => onDriverSelect(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Жолооч сонгох" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

