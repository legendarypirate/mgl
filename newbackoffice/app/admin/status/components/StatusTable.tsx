"use client";

import React from 'react';
import { Status } from '../types/status';
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
import dayjs from 'dayjs';

interface StatusTableProps {
  statuses: Status[];
  loading?: boolean;
  onDelete: (status: Status) => void;
}

const columnHelper = createColumnHelper<Status>();

export default function StatusTable({
  statuses,
  loading = false,
  onDelete,
}: StatusTableProps) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: 'Үүссэн огноо',
        cell: (info) => dayjs(info.getValue()).format('YYYY-MM-DD hh:mm A'),
      }),
      columnHelper.accessor('status', {
        header: 'Төлөв',
        cell: (info) => {
          const status = info.row.original;
          return (
            <span
              className="px-2 py-1 rounded text-sm"
              style={{ backgroundColor: status.color, color: 'black' }}
            >
              {status.status}
            </span>
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
    data: statuses,
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
              <TableHead>Төлөв</TableHead>
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
                Төлөв олдсонгүй
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
