"use client";

import React, { useMemo } from 'react';
import { Good } from '../types/good';
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

export default function GoodTable({
  goods,
  loading = false,
  onEdit,
  onDelete,
  onHistory,
  isMerchant = false,
}: GoodTableProps) {
  const merchantFilters = useMemo(() => {
    const uniqueMerchants = Array.from(
      new Set(goods.map((item) => item.merchant?.username).filter(Boolean))
    ).map((username) => ({
      text: username,
      value: username,
    }));
    return uniqueMerchants;
  }, [goods]);

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
              <TableHead>Үйлдэл</TableHead>
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
            <TableHead>Агуулах</TableHead>
            {!isMerchant && <TableHead>Дэлгүүр</TableHead>}
            <TableHead>Барааны нэр</TableHead>
            <TableHead>Үлдэгдэл</TableHead>
            <TableHead>Хүргэлтэнд</TableHead>
            <TableHead>Хүргэгдсэн</TableHead>
            <TableHead>Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goods.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isMerchant ? 6 : 7} className="text-center text-gray-400 py-8">
                Бараа олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            goods.map((good) => (
              <TableRow key={good.id}>
                <TableCell>{good.ware?.name}</TableCell>
                {!isMerchant && <TableCell>{good.merchant?.username || '-'}</TableCell>}
                <TableCell>{good.name}</TableCell>
                <TableCell>{good.stock || 0}</TableCell>
                <TableCell>{good.in_delivery || 0}</TableCell>
                <TableCell>{good.delivered || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(good)}
                      title="Орлогодох"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onHistory && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onHistory(good)}
                        title="Түүх харах"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(good)}
                      title="Устгах"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

