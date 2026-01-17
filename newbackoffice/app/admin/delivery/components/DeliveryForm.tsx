"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ProductItem, User, District } from '../types/delivery';
import { Plus, Trash2 } from 'lucide-react';

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  merchants: User[];
  districts: District[];
  isMerchant?: boolean;
  merchantId?: number;
  username?: string;
  products: Array<{ id: string; name: string }>;
  pullFromWarehouse: boolean;
  onPullFromWarehouseChange: (value: boolean) => void;
  onProductsFetch: (merchantId: number) => void;
}

export default function DeliveryForm({
  isOpen,
  onClose,
  onSubmit,
  merchants,
  districts,
  isMerchant = false,
  merchantId,
  username,
  products,
  pullFromWarehouse,
  onPullFromWarehouseChange,
  onProductsFetch,
}: DeliveryFormProps) {
  const [formData, setFormData] = useState({
    merchantId: merchantId?.toString() || '',
    phone: '',
    address: '',
    dist_id: '',
    price: '',
    is_paid: false,
    is_rural: false,
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [productPrice, setProductPrice] = useState(0);
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceDisabled, setPriceDisabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        merchantId: merchantId?.toString() || '',
        phone: '',
        address: '',
        dist_id: '',
        price: '',
        is_paid: false,
        is_rural: false,
      });
      setProductList([]);
      setSelectedProduct('');
      setQuantity(1);
      setProductPrice(0);
      setPriceDisabled(false);
    }
  }, [isOpen, merchantId]);

  useEffect(() => {
    if (pullFromWarehouse && formData.merchantId) {
      onProductsFetch(parseInt(formData.merchantId));
    }
  }, [pullFromWarehouse, formData.merchantId]);

  const handleIsPaidChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_paid: checked }));
    setPriceDisabled(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, price: '0' }));
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantity < 1) {
      return;
    }

    const productObj = products.find((p) => p.id === selectedProduct);
    if (productObj) {
      const newList = [
        ...productList,
        {
          productId: productObj.id,
          productName: productObj.name,
          quantity,
          price: productPrice,
        },
      ];

      const totalSum = newList.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setFormData((prev) => ({ ...prev, price: totalSum > 0 ? totalSum.toString() : '' }));

      setProductList(newList);
      setSelectedProduct('');
      setQuantity(1);
      setProductPrice(0);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const newList = productList.filter((item) => item.productId !== productId);
    const totalSum = newList.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setFormData((prev) => ({ ...prev, price: totalSum > 0 ? totalSum.toString() : '' }));
    setProductList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        merchant_id: isMerchant ? merchantId : parseInt(formData.merchantId),
        phone: formData.phone,
        address: formData.address,
        status: 1,
        dist_id: parseInt(formData.dist_id),
        is_paid: formData.is_paid,
        is_rural: formData.is_rural,
        price: Number(formData.price),
        comment: '',
        items: productList.map((item) => ({
          good_id: item.productId,
          quantity: item.quantity,
        })),
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
        <h2 className="text-xl font-semibold">Хүргэлт үүсгэх</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ×
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {isMerchant ? (
          <div className="space-y-2">
            <Label>Дэлгүүрийн нэр</Label>
            <div className="p-2 border rounded bg-gray-50">{username}</div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="merchantId">Дэлгүүрийн нэр *</Label>
            <Select
              value={formData.merchantId}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, merchantId: value }));
                if (pullFromWarehouse) {
                  onProductsFetch(parseInt(value));
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Дэлгүүр сонгох" />
              </SelectTrigger>
              <SelectContent>
                {merchants.map((merchant) => (
                  <SelectItem key={merchant.id} value={merchant.id.toString()}>
                    {merchant.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Утас *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Утасны дугаар"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Хаяг *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Хаяг"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dist_id">Дүүрэг *</Label>
          <Select
            value={formData.dist_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, dist_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Дүүрэг сонгох" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Үнэ *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="Үнэ"
            disabled={priceDisabled}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_paid"
            checked={formData.is_paid}
            onCheckedChange={handleIsPaidChange}
          />
          <Label htmlFor="is_paid" className="cursor-pointer">
            Тооцоо хийсэн
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_rural"
            checked={formData.is_rural}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_rural: checked as boolean }))
            }
          />
          <Label htmlFor="is_rural" className="cursor-pointer">
            Орон нутаг
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pullFromWarehouse"
            checked={pullFromWarehouse}
            onCheckedChange={onPullFromWarehouseChange}
          />
          <Label htmlFor="pullFromWarehouse" className="cursor-pointer">
            Агуулахаас бараа татах?
          </Label>
        </div>

        {pullFromWarehouse && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Бараа сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Тоо"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min={0}
                  value={productPrice}
                  onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Үнэ"
                />
              </div>
              <div className="col-span-1">
                <Button type="button" onClick={handleAddProduct} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {productList.length > 0 && (
              <div className="space-y-2">
                {productList.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm">
                      <strong>{item.productName}</strong> - {item.quantity} ширхэг -{' '}
                      {item.price.toLocaleString()} ₮
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Үүсгэж байна...' : 'Үүсгэх'}
        </Button>
      </form>
    </div>
  );
}

