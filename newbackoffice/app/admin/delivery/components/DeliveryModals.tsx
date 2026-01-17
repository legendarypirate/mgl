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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Delivery, DeliveryHistory, DeliveryStatus, User, Region } from '../types/delivery';
import { format } from 'date-fns';

interface DriverAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  drivers: User[];
  selectedDriverId: number | null;
  onDriverSelect: (driverId: number) => void;
  regions: Region[];
  selectedRegionId: number | null;
  onRegionSelect: (regionId: number | null) => void;
}

export function DriverAllocationModal({
  isOpen,
  onClose,
  onSave,
  drivers,
  selectedDriverId,
  onDriverSelect,
  regions,
  selectedRegionId,
  onRegionSelect,
}: DriverAllocationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Жолооч сонгох</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
         
          <div className="space-y-2">
            <Label>Жолооч</Label>
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

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  statuses: DeliveryStatus[];
  selectedStatusId: number | null;
  onStatusSelect: (statusId: number) => void;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  onSave,
  statuses,
  selectedStatusId,
  onStatusSelect,
}: StatusChangeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Төлөв солих</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedStatusId?.toString() || ''}
            onValueChange={(value) => onStatusSelect(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Төлөв сонгох" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status}
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

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DeliveryHistory[];
}

export function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Хүргэлтийн түүх</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Түүх олдсонгүй</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Жолооч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: item.status_name.color,
                          color: 'white',
                        }}
                      >
                        {item.status_name.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.driver
                        ? `${item.driver.username} (${item.driver.phone})`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Хаах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  delivery: Delivery | null;
  formData: { phone: string; address: string; price: string; delivery_date: string };
  onFormDataChange: (data: { phone: string; address: string; price: string; delivery_date: string }) => void;
}

export function EditModal({
  isOpen,
  onClose,
  onSave,
  delivery,
  formData,
  onFormDataChange,
}: EditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Утас & Хаяг засах</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Утас *</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) =>
                onFormDataChange({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Хаяг *</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) =>
                onFormDataChange({ ...formData, address: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Үнэ *</Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                onFormDataChange({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-delivery_date">Хүргэх огноо *</Label>
            <Input
              id="edit-delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) =>
                onFormDataChange({ ...formData, delivery_date: e.target.value })
              }
              required
            />
          </div>
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

interface DeliveryDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
}

export function DeliveryDateModal({
  isOpen,
  onClose,
  onSave,
  deliveryDate,
  onDeliveryDateChange,
}: DeliveryDateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хүргэх огноо тохируулах</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-delivery_date">Хүргэх огноо *</Label>
            <Input
              id="bulk-delivery_date"
              type="date"
              value={deliveryDate}
              onChange={(e) => onDeliveryDateChange(e.target.value)}
              required
            />
          </div>
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

