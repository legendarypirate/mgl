"use client";

import React from 'react';
import { Warehouse } from '../types/warehouse';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  loading?: boolean;
  onDelete: (warehouse: Warehouse) => void;
}

const columnHelper = createColumnHelper<Warehouse>();

export default function WarehouseTable({
  warehouses,
  loading = false,
  onDelete,
}: WarehouseTableProps) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: 'Үүссэн огноо',
        cell: (info) => format(new Date(info.getValue()), 'yyyy-MM-dd hh:mm a'),
      }),
      columnHelper.accessor('name', {
        header: 'Нэр',
        cell: (info) => {
          const warehouse = info.row.original;
          return warehouse.color ? (
            <Badge style={{ backgroundColor: warehouse.color }}>
              {warehouse.name}
            </Badge>
          ) : (
            warehouse.name
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Үйлдэл',
        cell: (info) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(info.row.original)}
            title="Устгах"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        ),
      }),
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: warehouses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Үүссэн огноо</TableHead>
              <TableHead>Нэр</TableHead>
              <TableHead>Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
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
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                Агуулах олдсонгүй
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
