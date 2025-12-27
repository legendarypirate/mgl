"use client";

import React from 'react';
import { Warehouse } from '../types/warehouse';
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

export default function WarehouseTable({
  warehouses,
  loading = false,
  onDelete,
}: WarehouseTableProps) {
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
          <TableRow>
            <TableHead>Үүссэн огноо</TableHead>
            <TableHead>Нэр</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                Агуулах олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>
                  {format(new Date(warehouse.createdAt), 'yyyy-MM-dd hh:mm a')}
                </TableCell>
                <TableCell>
                  {warehouse.color ? (
                    <Badge style={{ backgroundColor: warehouse.color }}>
                      {warehouse.name}
                    </Badge>
                  ) : (
                    warehouse.name
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(warehouse)}
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

