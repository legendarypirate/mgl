"use client";

import React from 'react';
import { Delivery, DeliveryItem } from '../types/delivery';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DeliveryTableProps {
  deliveries: Delivery[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  onRowSelect: (keys: React.Key[]) => void;
  onEdit: (delivery: Delivery) => void;
  onViewHistory: (deliveryId: number) => void;
  expandedRowKeys: React.Key[];
  expandedItems: Record<number, DeliveryItem[] | null>;
  loadingRows: number[];
  onExpand: (expanded: boolean, record: Delivery) => void;
  isMerchant?: boolean;
}

export default function DeliveryTable({
  deliveries,
  loading = false,
  selectedRowKeys,
  onRowSelect,
  onEdit,
  onViewHistory,
  expandedRowKeys,
  expandedItems,
  loadingRows,
  onExpand,
  isMerchant = false,
}: DeliveryTableProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const isRowSelected = (id: number) => selectedRowKeys.includes(id);
  const isRowExpanded = (id: number) => expandedRowKeys.includes(id);
  const allSelected = deliveries.length > 0 && selectedRowKeys.length === deliveries.length;
  const someSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < deliveries.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelect(deliveries.map((d) => d.id));
    } else {
      onRowSelect([]);
    }
  };

  const handleRowClick = (e: React.MouseEvent, delivery: Delivery) => {
    // Don't toggle selection if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const newKeys = isRowSelected(delivery.id)
      ? selectedRowKeys.filter((key) => key !== delivery.id)
      : [...selectedRowKeys, delivery.id];
    onRowSelect(newKeys);
  };

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Хүргэх огноо</TableHead>
              <TableHead>Хүргэсэн огноо</TableHead>
              {!isMerchant && <TableHead>Мерчанд нэр</TableHead>}
              <TableHead>Бараа</TableHead>
              <TableHead>Тоо ширхэг</TableHead>
              <TableHead>Утас</TableHead>
              <TableHead>Хаяг</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Үнэ</TableHead>
              <TableHead>Ж/тайлбар</TableHead>
              {!isMerchant && <TableHead>Жолооч нэр</TableHead>}
              {!isMerchant && <TableHead>Үйлдэл</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                {!isMerchant && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                {!isMerchant && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                {!isMerchant && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="border rounded-md">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
            </TableHead>
            <TableHead>Хүргэх огноо</TableHead>
            {!isMerchant && <TableHead>Мерчанд нэр</TableHead>}
            <TableHead>Бараа</TableHead>
            <TableHead>Тоо</TableHead>
            <TableHead>Утас</TableHead>
            <TableHead>Хаяг</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead>Үнэ</TableHead>
            <TableHead>Ж/тайлбар</TableHead>
            {!isMerchant && <TableHead>Жолооч нэр</TableHead>}
            {!isMerchant && <TableHead>Үйлдэл</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isMerchant ? 10 : 12} className="text-center text-gray-400 py-8">
                Хүргэлт олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => {
              const items = delivery.items || expandedItems[delivery.id] || [];
              const hasItems = items.length > 0;
              
              return (
                <React.Fragment key={delivery.id}>
                  {hasItems ? (
                    items.map((item, itemIndex) => (
                      <TableRow
                        key={`${delivery.id}-${itemIndex}`}
                        className={`cursor-pointer ${
                          isRowSelected(delivery.id) ? 'bg-blue-50' : ''
                        } ${itemIndex > 0 ? 'border-t border-gray-300' : ''}`}
                        onClick={(e) => handleRowClick(e, delivery)}
                      >
                        {itemIndex === 0 && (
                          <>
                            <TableCell rowSpan={items.length}>
                              <input
                                type="checkbox"
                                checked={isRowSelected(delivery.id)}
                                onChange={() => {
                                  const newKeys = isRowSelected(delivery.id)
                                    ? selectedRowKeys.filter((key) => key !== delivery.id)
                                    : [...selectedRowKeys, delivery.id];
                                  onRowSelect(newKeys);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell rowSpan={items.length}>
                              {delivery.delivery_date
                                ? format(new Date(delivery.delivery_date), 'yyyy-MM-dd')
                                : delivery.createdAt
                                ? format(new Date(delivery.createdAt), 'yyyy-MM-dd')
                                : '-'}
                            </TableCell>
                          
                            {!isMerchant && (
                              <TableCell rowSpan={items.length}>
                                {delivery.merchant?.username || '-'}
                              </TableCell>
                            )}
                          </>
                        )}
                        <TableCell className="max-w-xs">
                          <div className="text-sm">
                            {item.good?.name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.quantity}
                          </div>
                        </TableCell>
                        {itemIndex === 0 && (
                          <>
                            <TableCell rowSpan={items.length}>
                              <div className="font-medium">{delivery.phone}</div>
                            </TableCell>
                            <TableCell rowSpan={items.length} className="max-w-xs">
                              <div 
                                className="text-base text-gray-700 whitespace-normal break-words"
                              >
                                {delivery.address}
                              </div>
                            </TableCell>
                            <TableCell rowSpan={items.length}>
                              <Badge
                                style={{
                                  backgroundColor: delivery.status_name.color,
                                  color: 'white',
                                }}
                              >
                                {delivery.status_name.status}
                              </Badge>
                            </TableCell>
                            <TableCell rowSpan={items.length}>
                              {delivery.price?.toLocaleString() || 0}
                            </TableCell>
                          </>
                        )}
                        {itemIndex === 0 && (
                          <>
                            <TableCell className="max-w-xs" rowSpan={items.length}>
                              <div
                                className="text-xs whitespace-normal break-words"
                              >
                                {delivery.driver_comment || 'Тайлбаргүй'}
                              </div>
                            </TableCell>
                            {!isMerchant && (
                              <TableCell rowSpan={items.length}>
                                {delivery.driver?.username || '-'}
                              </TableCell>
                            )}
                            {!isMerchant && (
                              <TableCell rowSpan={items.length}>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(delivery);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewHistory(delivery.id);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {delivery.delivery_image && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(delivery.delivery_image || null);
                                      }}
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow
                      className={`cursor-pointer ${
                        isRowSelected(delivery.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={(e) => handleRowClick(e, delivery)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isRowSelected(delivery.id)}
                          onChange={() => {
                            const newKeys = isRowSelected(delivery.id)
                              ? selectedRowKeys.filter((key) => key !== delivery.id)
                              : [...selectedRowKeys, delivery.id];
                            onRowSelect(newKeys);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        {delivery.delivery_date
                          ? format(new Date(delivery.delivery_date), 'yyyy-MM-dd')
                          : delivery.createdAt
                          ? format(new Date(delivery.createdAt), 'yyyy-MM-dd')
                          : '-'}
                      </TableCell>
                      {!isMerchant && (
                        <TableCell>{delivery.merchant?.username || '-'}</TableCell>
                      )}
                      <TableCell className="max-w-xs">
                        <div className="text-sm">-</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">-</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{delivery.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div 
                          className="text-base text-gray-700 whitespace-normal break-words"
                        >
                          {delivery.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: delivery.status_name.color,
                            color: 'white',
                          }}
                        >
                          {delivery.status_name.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.price?.toLocaleString() || 0}</TableCell>
                      <TableCell className="max-w-xs">
                        <div
                          className="text-xs whitespace-normal break-words"
                        >
                          {delivery.driver_comment || 'Тайлбаргүй'}
                        </div>
                      </TableCell>
                      {!isMerchant && (
                        <TableCell>{delivery.driver?.username || '-'}</TableCell>
                      )}
                      {!isMerchant && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(delivery);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewHistory(delivery.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {delivery.delivery_image && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImage(delivery.delivery_image || null);
                                }}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                {isRowExpanded(delivery.id) && (
                  <TableRow>
                    <TableCell colSpan={isMerchant ? 10 : 12}>
                      {loadingRows.includes(delivery.id) ? (
                        <div className="p-4 text-center">Loading items...</div>
                      ) : (
                        <div className="p-4">
                          {expandedItems[delivery.id] && expandedItems[delivery.id]!.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Бараа</TableHead>
                                  <TableHead>Тоо ширхэг</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {expandedItems[delivery.id]!.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.good?.name || '-'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center text-gray-400">Бараа олдсонгүй</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
    
    <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
      <DialogContent className="max-w-4xl">
        {selectedImage && (
          <div className="flex justify-center items-center">
            <img
              src={selectedImage}
              alt="Delivery Image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </React.Fragment>
  );
}

