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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ProductItem, User, District } from '../types/delivery';
import { Plus, Trash2, Warehouse } from 'lucide-react';
import { getTodayLocal } from '@/lib/utils';

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  merchants: User[];
  districts: District[];
  isMerchant?: boolean;
  merchantId?: number;
  username?: string;
  products: Array<{ id: string; name: string; stock: number }>;
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
    delivery_date: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [productPrice, setProductPrice] = useState(0);
  const [productPriceInput, setProductPriceInput] = useState<string>('');
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceDisabled, setPriceDisabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = getTodayLocal();
      setFormData({
        merchantId: merchantId?.toString() || '',
        phone: '',
        address: '',
        dist_id: '',
        price: '',
        is_paid: false,
        is_rural: false,
        delivery_date: today,
      });
      setProductList([]);
      setSelectedProduct('');
      setQuantity(1);
      setProductPrice(0);
      setProductPriceInput('');
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
      setProductPriceInput('');
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

    // Validate stock before submitting
    if (pullFromWarehouse && productList.length > 0) {
      for (const item of productList) {
        const product = products.find((p) => p.id === item.productId);
        if (product && item.quantity > product.stock) {
          alert('Агуулахын үлдэгдэл хүрэлцэхгүй');
          setIsSubmitting(false);
          return;
        }
      }
    }

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
        delivery_date: formData.delivery_date || undefined,
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
          <Label htmlFor="delivery_date">Хүргэх огноо *</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, delivery_date: e.target.value }))}
            required
          />
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
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <Warehouse className="h-4 w-4 text-green-700" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Бараа нэмэх</h3>
              </div>

              {/* Existing items */}
              {productList.length > 0 && (
                <div className="space-y-2">
                  {productList.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
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

              {/* Input fields */}
              <div className="space-y-2">
                <SearchableSelect
                  options={products
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.stock})`,
                    }))}
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  placeholder="Бараа сонгох (Үлдэгдэл)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Тоо"
                    className="w-full"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={productPriceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductPriceInput(value);
                      if (value === '') {
                        setProductPrice(0);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setProductPrice(numValue);
                        }
                      }
                    }}
                    placeholder="Үнэ"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Add Item Entry Button - Always visible and prominent at bottom */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProduct}
                disabled={!selectedProduct || quantity < 1}
                className="w-full border-2 border-green-700 text-green-700 hover:bg-green-50 font-semibold py-3 h-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Бараа нэмэх
              </Button>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Үүсгэж байна...' : 'Үүсгэх'}
        </Button>
      </form>
    </div>
  );
}

