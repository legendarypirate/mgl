"use client";

import React from 'react';
import { GoodRequest } from '../types/good-request';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface GoodRequestTableProps {
  requests: GoodRequest[];
  loading?: boolean;
  onApprove?: (request: GoodRequest) => void;
  onDecline?: (request: GoodRequest) => void;
  isMerchant?: boolean;
}

const columnHelper = createColumnHelper<GoodRequest>();

export default function GoodRequestTable({
  requests,
  loading = false,
  onApprove,
  onDecline,
  isMerchant = false,
}: GoodRequestTableProps) {
  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'Шинэ бараа үүсгэх';
      case 2:
        return 'Нэмэх';
      case 3:
        return 'Хасах';
      default:
        return 'Тодорхойгүй';
    }
  };

  const getTypeBadgeColor = (type: number) => {
    switch (type) {
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Хүлээгдэж байна';
      case 2:
        return 'Зөвшөөрөгдсөн';
      case 3:
        return 'Татгалзсан';
      default:
        return 'Тодорхойгүй';
    }
  };

  const getStatusBadgeColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = React.useMemo(
    () => [
      ...(!isMerchant
        ? [
            columnHelper.accessor('merchant.username', {
              header: 'Дэлгүүр',
              cell: (info) => info.getValue() || 'Тодорхойгүй',
            }),
          ]
        : []),
      columnHelper.accessor('type', {
        header: 'Төрөл',
        cell: (info) => (
          <Badge className={getTypeBadgeColor(info.getValue())}>
            {getTypeLabel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.good?.name || row.name, {
        id: 'goodName',
        header: 'Бараа',
        cell: (info) => info.getValue() || 'Тодорхойгүй',
      }),
      columnHelper.accessor('ware.name', {
        header: 'Агуулах',
        cell: (info) => info.getValue() || 'Тодорхойгүй',
      }),
      columnHelper.accessor('stock', {
        header: 'Хүсэлтийн тоо',
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('approved_stock', {
        header: 'Зөвшөөрсөн тоо',
        cell: (info) =>
          info.getValue() !== null ? (
            <span className="font-semibold text-green-600">{info.getValue()}</span>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      }),
      columnHelper.accessor('status', {
        header: 'Төлөв',
        cell: (info) => (
          <Badge className={getStatusBadgeColor(info.getValue())}>
            {getStatusLabel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Огноо',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      }),
      ...(!isMerchant
        ? [
            columnHelper.display({
              id: 'actions',
              header: 'Үйлдэл',
              cell: (info) => {
                const request = info.row.original;
                if (request.status === 1 && onApprove && onDecline) {
                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onApprove(request)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Зөвшөөрөх
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDecline(request)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Татгалзах
                      </Button>
                    </div>
                  );
                }
                return <span className="text-sm text-gray-400">Дууссан</span>;
              },
            }),
          ]
        : []),
    ],
    [isMerchant, onApprove, onDecline]
  );

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {!isMerchant && <TableHead>Дэлгүүр</TableHead>}
              <TableHead>Төрөл</TableHead>
              <TableHead>Бараа</TableHead>
              <TableHead>Агуулах</TableHead>
              <TableHead>Хүсэлтийн тоо</TableHead>
              <TableHead>Зөвшөөрсөн тоо</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Огноо</TableHead>
              {!isMerchant && <TableHead>Үйлдэл</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                {!isMerchant && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                {!isMerchant && (
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-gray-500">
        Хүсэлт олдсонгүй
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
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
