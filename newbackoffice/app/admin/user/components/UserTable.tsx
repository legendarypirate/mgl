"use client";

import React from 'react';
import { User } from '../types/user';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
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

const columnHelper = createColumnHelper<User>();

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

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
      }),
      columnHelper.accessor('username', {
        header: 'Username',
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('bank', {
        header: 'Bank',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('account_number', {
        header: 'Account Number',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('report_price', {
        header: 'Report Price',
        cell: (info) => `${info.getValue() || 7000} ₮`,
      }),
      columnHelper.accessor('role_id', {
        header: 'Role',
        cell: (info) => (
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
            {getRoleLabel(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: (info) => <span className="text-xs">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated At',
        cell: (info) => <span className="text-xs">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(info.row.original)}
                title="Засах"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(info.row.original)}
              title="Устгах"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              <TableHead>Bank</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Report Price</TableHead>
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

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-gray-400 py-8">
                Хэрэглэгч олдсонгүй
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
