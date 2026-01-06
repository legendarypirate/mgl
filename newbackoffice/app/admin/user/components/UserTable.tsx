"use client";

import React from 'react';
import { User } from '../types/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
}: UserTableProps) {
  const getRoleLabel = (roleId: number) => {
    const roles: Record<number, string> = {
      1: 'Admin',
      2: 'Customer',
      3: 'Driver',
    };
    return roles[roleId] || `Role ${roleId}`;
  };

  if (loading) {
    return (
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-gray-400 py-8">
                Хэрэглэгч олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.bank || '-'}</TableCell>
                <TableCell>{user.account_number || '-'}</TableCell>
               
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    {getRoleLabel(user.role_id)}
                  </span>
                </TableCell>
                <TableCell className="text-xs">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-xs">{formatDate(user.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                        title="Засах"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
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
