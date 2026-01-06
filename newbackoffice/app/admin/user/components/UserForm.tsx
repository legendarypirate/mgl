"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { User } from '../types/user';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
}

export default function UserForm({
  isOpen,
  onClose,
  onSubmit,
  user,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    bank: '',
    account_number: '',
    contact_info: '',
    address: '',
    password: '',
    role_id: '', // No default - user must select
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode - populate form with user data (no role_id)
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          bank: user.bank || '',
          account_number: user.account_number || '',
          contact_info: user.contact_info || '',
          address: user.address || '',
          password: '', // Don't populate password for security
          role_id: '', // No role selection in edit mode
        });
      } else {
        // Create mode - reset form
        setFormData({
          username: '',
          email: '',
          phone: '',
          bank: '',
          account_number: '',
          contact_info: '',
          address: '',
          password: '',
          role_id: '', // No default - user must select
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate role_id is selected when creating
    if (!user && !formData.role_id) {
      alert('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        username: formData.username,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        bank: formData.bank || undefined,
        account_number: formData.account_number || undefined,
        contact_info: formData.contact_info || undefined,
        address: formData.address || undefined,
      };
      
      // Only include role_id when creating (not when editing)
      if (!user && formData.role_id) {
        payload.role_id = parseInt(formData.role_id);
      }
      
      // Only include password if it's provided (for edit mode) or required (for create mode)
      if (formData.password) {
        payload.password = formData.password;
      }

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
        <h2 className="text-xl font-semibold">{user ? 'Хэрэглэгч засах' : 'Хэрэглэгч үүсгэх'}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Bank Name</Label>
          <Input
            id="bank"
            value={formData.bank}
            onChange={(e) => setFormData((prev) => ({ ...prev, bank: e.target.value }))}
            placeholder="Bank name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            value={formData.account_number}
            onChange={(e) => setFormData((prev) => ({ ...prev, account_number: e.target.value }))}
            placeholder="Account number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_info">Contact Info</Label>
          <Input
            id="contact_info"
            value={formData.contact_info}
            onChange={(e) => setFormData((prev) => ({ ...prev, contact_info: e.target.value }))}
            placeholder="Contact info"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Address"
            rows={3}
          />
        </div>

        {/* Role selection - only show when creating (not editing) */}
        {!user && (
          <div className="space-y-2">
            <Label htmlFor="role_id">Role *</Label>
            <Select
              value={formData.role_id || undefined}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Customer</SelectItem>
                <SelectItem value="3">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password {user ? '' : '*'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={user ? 'Leave empty to keep current password' : 'Password'}
            required={!user}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
      </form>
    </div>
  );
}
