"use client";

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import RequestTable from './components/RequestTable';
import RequestForm from './components/RequestForm';
import { EditPhoneModal } from './components/RequestModals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { User } from './types/request';
import {
  fetchUsers,
  createUser,
  updateUserPhone,
  deleteUser,
} from './services/request.service';

export default function RequestPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  // Form/Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter users to show only role_id 3 (drivers) and apply search filter
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.role_id === 3 &&
        user.username.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

  // Update pagination total when filtered data changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredUsers.length,
    }));
  }, [filteredUsers.length]);

  // Load users on page load
  useEffect(() => {
    document.title = 'Хэрэглэгч';
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Хэрэглэгч ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page when searching
  };

  const handleCreateUser = async (payload: any) => {
    try {
      const newUser = await createUser(payload);
      setUsers((prev) => [...prev, newUser]);
      toast.success('Хэрэглэгч амжилттай үүслээ');
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Хэрэглэгч үүсгэхэд алдаа гарлаа');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditPhone = async (phone: string) => {
    if (!editingUser) return;

    try {
      const updatedUser = await updateUserPhone(editingUser.id, { phone });
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );
      toast.success('Утасны дугаар амжилттай шинэчлэгдлээ');
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDelete = (user: User) => {
    if (!confirm(`Та "${user.username}" хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    const deleteUserAsync = async () => {
      try {
        await deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success(`"${user.username}" хэрэглэгч амжилттай устгагдлаа`);
      } catch (error: any) {
        toast.error(error.message || 'Устгахад алдаа гарлаа');
      }
    };

    deleteUserAsync();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Хэрэглэгч (Зөвхөн Drivers)
        </h1>
        <Button onClick={() => setIsDrawerOpen(true)}>
          + Хэрэглэгч үүсгэх
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Нийт: {filteredUsers.length} driver(s)
        </div>
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <RequestTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      {/* Create User Drawer */}
      <RequestForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit Phone Modal */}
      <EditPhoneModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleEditPhone}
        user={editingUser}
      />
    </div>
  );
}

