"use client";

import React, { useMemo } from 'react';
import { Good } from '../types/good';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GoodTableProps {
  goods: Good[];
  loading?: boolean;
  onEdit: (good: Good) => void;
  onDelete: (good: Good) => void;
  onHistory?: (good: Good) => void;
  isMerchant?: boolean;
}

const columnHelper = createColumnHelper<Good>();

export default function GoodTable({
  goods,
  loading = false,
  onEdit,
  onDelete,
  onHistory,
  isMerchant = false,
}: GoodTableProps) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('ware.name', {
        header: 'Агуулах',
      }),
      ...(!isMerchant
        ? [
            columnHelper.accessor('merchant.username', {
              header: 'Дэлгүүр',
              cell: (info) => info.getValue() || '-',
            }),
          ]
        : []),
      columnHelper.accessor('name', {
        header: 'Барааны нэр',
      }),
      columnHelper.accessor('stock', {
        header: 'Үлдэгдэл',
        cell: (info) => info.getValue() || 0,
      }),
      columnHelper.accessor('in_delivery', {
        header: 'Хүргэлтэнд',
        cell: (info) => info.getValue() || 0,
      }),
      columnHelper.accessor('delivered', {
        header: 'Хүргэгдсэн',
        cell: (info) => info.getValue() || 0,
      }),
      ...(!isMerchant
        ? [
            columnHelper.display({
              id: 'actions',
              header: 'Үйлдэл',
              cell: (info) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(info.row.original)}
                    title="Орлогодох"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onHistory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onHistory(info.row.original)}
                      title="Түүх харах"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(info.row.original)}
                    title="Устгах"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ),
            }),
          ]
        : []),
    ],
    [isMerchant, onEdit, onDelete, onHistory]
  );

  const table = useReactTable({
    data: goods,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Агуулах</TableHead>
              {!isMerchant && <TableHead>Дэлгүүр</TableHead>}
              <TableHead>Барааны нэр</TableHead>
              <TableHead>Үлдэгдэл</TableHead>
              <TableHead>Хүргэлтэнд</TableHead>
              <TableHead>Хүргэгдсэн</TableHead>
              {!isMerchant && <TableHead>Үйлдэл</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                {!isMerchant && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isMerchant ? 5 : 7} className="text-center text-gray-400 py-8">
                Бараа олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
