"use client";

import React from 'react';
import { Order, OrderStatus } from '../types/order';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  onRowSelect: (keys: React.Key[]) => void;
  statusList: OrderStatus[];
  isMerchant?: boolean;
  onDelete?: (id: number) => void;
}

export default function OrderTable({
  orders,
  loading = false,
  selectedRowKeys,
  onRowSelect,
  statusList,
  isMerchant = false,
  onDelete,
}: OrderTableProps) {
  const isRowSelected = (id: number) => selectedRowKeys.includes(id);

  const handleRowClick = (e: React.MouseEvent, order: Order) => {
    // Don't toggle selection if clicking on checkbox
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    const newKeys = isRowSelected(order.id)
      ? selectedRowKeys.filter((key) => key !== order.id)
      : [...selectedRowKeys, order.id];
    onRowSelect(newKeys);
  };

  const getStatusInfo = (status: number | string) => {
    const found = statusList.find((s) => s.id === Number(status));
    return found || { label: 'Unknown', color: 'gray' };
  };

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Үүссэн огноо</TableHead>
              {!isMerchant && <TableHead>Мерчанд нэр</TableHead>}
              <TableHead>Утас</TableHead>
              <TableHead>Хаяг</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Тайлбар</TableHead>
              {!isMerchant && <TableHead>Жолооч нэр</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                {!isMerchant && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                {!isMerchant && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                {!isMerchant && onDelete && (
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Үүссэн огноо</TableHead>
            {!isMerchant && <TableHead>Мерчанд нэр</TableHead>}
            <TableHead>Утас</TableHead>
            <TableHead>Хаяг</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead>Тайлбар</TableHead>
            {!isMerchant && <TableHead>Жолооч нэр</TableHead>}
            {!isMerchant && onDelete && <TableHead className="w-20">Үйлдэл</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isMerchant ? 7 : (onDelete ? 9 : 8)}
                className="text-center text-gray-400 py-8"
              >
                Захиалга олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <TableRow
                  key={order.id}
                  className={`cursor-pointer ${
                    isRowSelected(order.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={(e) => handleRowClick(e, order)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isRowSelected(order.id)}
                      onChange={() => {
                        const newKeys = isRowSelected(order.id)
                          ? selectedRowKeys.filter((key) => key !== order.id)
                          : [...selectedRowKeys, order.id];
                        onRowSelect(newKeys);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    {order.createdAt
                      ? format(new Date(order.createdAt), 'yyyy-MM-dd hh:mm a')
                      : '-'}
                  </TableCell>
                  {!isMerchant && (
                    <TableCell>{order.merchant?.username || '-'}</TableCell>
                  )}
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.address}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: statusInfo.color,
                        color: 'white',
                      }}
                    >
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {order.comment || '-'}
                  </TableCell>
                  {!isMerchant && (
                    <TableCell>{order.driver?.username || '-'}</TableCell>
                  )}
                  {!isMerchant && onDelete && (
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(order.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

