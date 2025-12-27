"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StatusTable from './components/StatusTable';
import StatusForm from './components/StatusForm';
import { Button } from '@/components/ui/button';
import { Status } from './types/status';
import { fetchStatuses, createStatus, deleteStatus } from './services/status.service';

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    document.title = 'Хүргэлтийн төлөв';
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    setLoading(true);
    try {
      const data = await fetchStatuses();
      setStatuses(data);
    } catch (error: any) {
      console.error('Error loading statuses:', error);
      toast.error(error.message || 'Төлөв ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatus = async (payload: { status: string }) => {
    try {
      const newStatus = await createStatus(payload);
      setStatuses((prev) => [...prev, newStatus]);
      toast.success('Төлөв амжилттай үүсгэгдлээ');
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Төлөв үүсгэхэд алдаа гарлаа');
    }
  };

  const handleDeleteStatus = (status: Status) => {
    if (!confirm(`Та "${status.status}" төлөвийг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    const deleteStatusAsync = async () => {
      try {
        await deleteStatus(status.id);
        setStatuses((prev) => prev.filter((s) => s.id !== status.id));
        toast.success(`"${status.status}" төлөв амжилттай устгагдлаа`);
      } catch (error: any) {
        toast.error(error.message || 'Устгахад алдаа гарлаа');
      }
    };

    deleteStatusAsync();
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Төлөв</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>+ Төлөв үүсгэх</Button>
      </div>

      <StatusTable
        statuses={statuses}
        loading={loading}
        onDelete={handleDeleteStatus}
      />

      <StatusForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateStatus}
      />
    </div>
  );
}

