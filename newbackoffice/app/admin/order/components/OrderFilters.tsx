"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types/order';
import { Plus } from 'lucide-react';

interface OrderFiltersProps {
  phoneFilter: string;
  onPhoneFilterChange: (value: string) => void;
  statusList: OrderStatus[];
  selectedStatuses: number[];
  onStatusToggle: (statusId: number) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  onAddOrder: () => void;
  hasPermission: (perm: string) => boolean;
}

export default function OrderFilters({
  phoneFilter,
  onPhoneFilterChange,
  statusList,
  selectedStatuses,
  onStatusToggle,
  dateRange,
  onDateRangeChange,
  onAddOrder,
  hasPermission,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Input
        placeholder="Утасаар шүүх"
        value={phoneFilter}
        onChange={(e) => onPhoneFilterChange(e.target.value)}
        className="w-48"
      />

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateRange[0] ? dateRange[0].toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const start = e.target.value ? new Date(e.target.value) : null;
            onDateRangeChange([start, dateRange[1]]);
          }}
          className="w-40"
        />
        <span className="text-gray-500">-</span>
        <Input
          type="date"
          value={dateRange[1] ? dateRange[1].toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const end = e.target.value ? new Date(e.target.value) : null;
            onDateRangeChange([dateRange[0], end]);
          }}
          className="w-40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {statusList.map((status) => (
          <Badge
            key={status.id}
            style={{
              backgroundColor: selectedStatuses.includes(status.id) ? status.color : 'transparent',
              color: selectedStatuses.includes(status.id) ? 'white' : status.color,
              border: `1px solid ${status.color}`,
              cursor: 'pointer',
            }}
            onClick={() => onStatusToggle(status.id)}
          >
            {status.label}
          </Badge>
        ))}
      </div>

      {hasPermission('order:create_order') && (
        <div className="ml-auto">
          <Button onClick={onAddOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Захиалга үүсгэх
          </Button>
        </div>
      )}
    </div>
  );
}

