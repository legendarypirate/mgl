"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { User } from './types/user';
import { fetchUsers, createUser, updateUser, deleteUser } from './services/user.service';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  // Fetch users
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Хэрэглэгч ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Хэрэглэгч';
    fetchData();
  }, []);

  // Filter users - only show customers (role_id === 2) and apply search
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.role_id === 2 &&
        user.username.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));
  }, [users, searchText]);

  // Get current page data
  const currentPageData = filteredUsers.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const handleDelete = (user: User) => {
    if (!confirm(`Устгахдаа итгэлтэй байна уу? "${user.username}" устгах`)) {
      return;
    }

    const deleteUserAsync = async () => {
      try {
        await deleteUser(user.id);
        toast.success('Амжилттай устгалаа');
        fetchData();
      } catch (error: any) {
        toast.error(error.message || 'Устгахад алдаа гарлаа');
      }
    };

    deleteUserAsync();
  };

  const handleCreateUser = async (payload: any) => {
    try {
      await createUser(payload);
      toast.success('Хэрэглэгч амжилттай үүслээ');
      setIsDrawerOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Хэрэглэгч үүсгэхэд алдаа гарлаа');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleUpdateUser = async (payload: any) => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, payload);
      toast.success('Хэрэглэгч амжилттай шинэчлэгдлээ');
      setIsDrawerOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Хэрэглэгч шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Хэрэглэгч (Зөвхөн Customers)</h1>
      </div>

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="text-sm text-gray-600">
          Нийт: {filteredUsers.length} customer(s)
        </div>

        <div className="flex-1 min-w-[250px]">
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

        <Button onClick={() => {
          setEditingUser(null);
          setIsDrawerOpen(true);
        }}>+ Хэрэглэгч үүсгэх</Button>
      </div>

      <UserTable
        users={currentPageData}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Нийт: {pagination.total} | Хуудас: {pagination.current} /{' '}
          {Math.ceil(pagination.total / pagination.pageSize)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({ ...prev, current: Math.max(1, prev.current - 1) }))
            }
            disabled={pagination.current === 1}
          >
            Өмнөх
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current: Math.min(
                  Math.ceil(pagination.total / pagination.pageSize),
                  prev.current + 1
                ),
              }))
            }
            disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
          >
            Дараах
          </Button>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) =>
              setPagination((prev) => ({ ...prev, pageSize: parseInt(value), current: 1 }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drawer */}
      <UserForm
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
}
