"use client";

import React from 'react';
import { Order, OrderStatus } from '../types/order';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
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

const columnHelper = createColumnHelper<Order>();

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

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: 'checkbox',
        header: '',
        cell: (info) => (
          <input
            type="checkbox"
            checked={isRowSelected(info.row.original.id)}
            onChange={() => {
              const newKeys = isRowSelected(info.row.original.id)
                ? selectedRowKeys.filter((key) => key !== info.row.original.id)
                : [...selectedRowKeys, info.row.original.id];
              onRowSelect(newKeys);
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded"
          />
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Үүссэн огноо',
        cell: (info) =>
          info.getValue()
            ? format(new Date(info.getValue()), 'yyyy-MM-dd hh:mm a')
            : '-',
      }),
      ...(!isMerchant
        ? [
            columnHelper.accessor('merchant.username', {
              header: 'Мерчанд нэр',
              cell: (info) => info.getValue() || '-',
            }),
          ]
        : []),
      columnHelper.accessor('phone', {
        header: 'Утас',
      }),
      columnHelper.accessor('address', {
        header: 'Хаяг',
      }),
      columnHelper.accessor('status', {
        header: 'Төлөв',
        cell: (info) => {
          const statusInfo = getStatusInfo(info.getValue());
          return (
            <Badge
              style={{
                backgroundColor: statusInfo.color,
                color: 'white',
              }}
            >
              {statusInfo.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('comment', {
        header: 'Тайлбар',
        cell: (info) => (
          <span className="max-w-xs truncate">{info.getValue() || '-'}</span>
        ),
      }),
      ...(!isMerchant
        ? [
            columnHelper.accessor('driver.username', {
              header: 'Жолооч нэр',
              cell: (info) => info.getValue() || '-',
            }),
          ]
        : []),
      ...(!isMerchant && onDelete
        ? [
            columnHelper.display({
              id: 'actions',
              header: 'Үйлдэл',
              cell: (info) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(info.row.original.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ),
            }),
          ]
        : []),
    ],
    [selectedRowKeys, onRowSelect, statusList, isMerchant, onDelete]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              {!isMerchant && onDelete && <TableHead className="w-20">Үйлдэл</TableHead>}
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
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={header.id === 'checkbox' ? 'w-12' : ''}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isMerchant ? 7 : (onDelete ? 9 : 8)}
                className="text-center text-gray-400 py-8"
              >
                Захиалга олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const order = row.original;
              return (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer ${
                    isRowSelected(order.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={(e) => handleRowClick(e, order)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
