"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeliveryStatus, User, District } from '../types/delivery';
import { Upload, Plus, ChevronDown } from 'lucide-react';
import { formatDateLocal } from '@/lib/utils';

interface DeliveryFiltersProps {
  phoneFilter: string;
  onPhoneFilterChange: (value: string) => void;
  merchants: User[];
  selectedMerchantId: number | null;
  onMerchantFilterChange: (value: number | null) => void;
  drivers: User[];
  selectedDriverId: number | null;
  onDriverFilterChange: (value: number | null) => void;
  districts: District[];
  selectedDistrictId: number | null;
  onDistrictFilterChange: (value: number | null) => void;
  statusList: DeliveryStatus[];
  selectedStatuses: number[];
  onStatusToggle: (statusId: number) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  onAddDelivery: () => void;
  onExcelImport: () => void;
  hasPermission: (perm: string) => boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function DeliveryFilters({
  phoneFilter,
  onPhoneFilterChange,
  merchants,
  selectedMerchantId,
  onMerchantFilterChange,
  drivers,
  selectedDriverId,
  onDriverFilterChange,
  districts,
  selectedDistrictId,
  onDistrictFilterChange,
  statusList,
  selectedStatuses,
  onStatusToggle,
  dateRange,
  onDateRangeChange,
  onAddDelivery,
  onExcelImport,
  hasPermission,
  fileInputRef,
}: DeliveryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Input
        placeholder="Утасаар шүүх"
        value={phoneFilter}
        onChange={(e) => onPhoneFilterChange(e.target.value)}
        className="w-48"
      />

      <Select
        value={selectedDriverId?.toString() || 'all'}
        onValueChange={(value) => onDriverFilterChange(value === 'all' ? null : parseInt(value))}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Жолоочноор шүүх" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүгд</SelectItem>
          {drivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id.toString()}>
              {driver.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDistrictId?.toString() || 'all'}
        onValueChange={(value) => onDistrictFilterChange(value === 'all' ? null : parseInt(value))}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Дүүргээр шүүх" />
        </SelectTrigger>
        <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
          <SelectItem value="all">Бүгд</SelectItem>
          {districts.map((district) => (
            <SelectItem key={district.id} value={district.id.toString()}>
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMerchantId?.toString() || 'all'}
        onValueChange={(value) => onMerchantFilterChange(value === 'all' ? null : parseInt(value))}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Мерчандаар шүүх" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Бүгд</SelectItem>
          {merchants.map((merchant) => (
            <SelectItem key={merchant.id} value={merchant.id.toString()}>
              {merchant.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateRange[0] ? formatDateLocal(dateRange[0]) : ''}
          onChange={(e) => {
            const start = e.target.value ? new Date(e.target.value) : null;
            onDateRangeChange([start, dateRange[1]]);
          }}
          className="w-40"
        />
        <span className="text-gray-500">-</span>
        <Input
          type="date"
          value={dateRange[1] ? formatDateLocal(dateRange[1]) : ''}
          onChange={(e) => {
            const end = e.target.value ? new Date(e.target.value) : null;
            onDateRangeChange([dateRange[0], end]);
          }}
          className="w-40"
        />
      </div>

      <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="min-w-32 max-w-48 justify-between truncate">
      <span className="truncate">
        {selectedStatuses.length === 0
          ? 'Төлөв'
          : selectedStatuses.length === 1
          ? (statusList.find((s) => s.id === selectedStatuses[0])?.status || 'Сонгосон')
          : `${selectedStatuses.length} төлөв`}
      </span>
      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-1" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent 
    className="w-48 max-h-60 overflow-y-auto"
    onCloseAutoFocus={(e) => {
      // Prevent focus from being stolen when selecting items
      e.preventDefault();
    }}
  >
    {statusList.map((status) => {
      const isSelected = selectedStatuses.includes(status.id);
      return (
        <DropdownMenuCheckboxItem
          key={status.id}
          checked={isSelected}
          onCheckedChange={() => onStatusToggle(status.id)}
          className="flex items-center gap-2"
          onSelect={(e) => e.preventDefault()} // Prevent menu from closing
        >
          <div
            className="w-3 h-3 rounded-full border flex-shrink-0"
            style={{
              backgroundColor: isSelected ? status.color : 'transparent',
              borderColor: status.color,
            }}
          />
          <span>{status.status}</span>
        </DropdownMenuCheckboxItem>
      );
    })}
  </DropdownMenuContent>
</DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExcelImport}
            size="icon"
            title="Excel Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
        <Button onClick={onAddDelivery} size="icon" title="Хүргэлт нэмэх">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
      />
    </div>
  );
}

