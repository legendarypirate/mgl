"use client";

import React from 'react';
import { GoodRequest } from '../types/good-request';
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
          {requests.map((request) => (
            <TableRow key={request.id}>
              {!isMerchant && (
                <TableCell>
                  {request.merchant?.username || 'Тодорхойгүй'}
                </TableCell>
              )}
              <TableCell>
                <Badge className={getTypeBadgeColor(request.type)}>
                  {getTypeLabel(request.type)}
                </Badge>
              </TableCell>
              <TableCell>
                {request.good?.name || request.name || 'Тодорхойгүй'}
              </TableCell>
              <TableCell>
                {request.ware?.name || 'Тодорхойгүй'}
              </TableCell>
              <TableCell>
                <span className="font-semibold">{request.stock}</span>
              </TableCell>
              <TableCell>
                {request.approved_stock !== null ? (
                  <span className="font-semibold text-green-600">{request.approved_stock}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(request.createdAt).toLocaleDateString('mn-MN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </TableCell>
              {!isMerchant && (
                <TableCell>
                  {request.status === 1 && onApprove && onDecline && (
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
                  )}
                  {request.status !== 1 && (
                    <span className="text-sm text-gray-400">Дууссан</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

