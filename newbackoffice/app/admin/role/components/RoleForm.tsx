"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Permission } from '../types/role';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permissions: number[]) => Promise<void>;
  roleName: string;
  permissions: Permission[];
  selectedPermissions: number[];
}

export default function RoleForm({
  isOpen,
  onClose,
  onSubmit,
  roleName,
  permissions,
  selectedPermissions: initialSelectedPermissions,
}: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(initialSelectedPermissions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPermissions(initialSelectedPermissions);
    }
  }, [isOpen, initialSelectedPermissions]);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedPermissions);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Permissions: {roleName}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between space-x-2">
                <Label htmlFor={`permission-${permission.id}`} className="flex-1">
                  {permission.module} - {permission.action}
                </Label>
                <Switch
                  id={`permission-${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={() => handleTogglePermission(permission.id)}
                />
              </div>
            ))}
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Цуцлах
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Хадгалж байна...' : 'Save Permissions'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

