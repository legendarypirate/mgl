"use client";

import React from 'react';
import { Status } from '../types/status';
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

export default function StatusTable({
  statuses,
  loading = false,
  onDelete,
}: StatusTableProps) {
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
          <TableRow>
            <TableHead>Үүссэн огноо</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statuses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                Төлөв олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            statuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell>
                  {dayjs(status.createdAt).format('YYYY-MM-DD hh:mm A')}
                </TableCell>
                <TableCell>
                  <span
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: status.color, color: 'black' }}
                  >
                    {status.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(status)}
                    title="Устгах"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

