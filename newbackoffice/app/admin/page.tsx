"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStatuses, fetchDeliveryStatusCounts, type Status } from './services/dashboard.service';

export default function AdminHome() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user data from localStorage
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const parsedUser = userData ? JSON.parse(userData) : null;
        const merchant_id = parsedUser?.role === 2 ? parsedUser.id : null;
        setMerchantId(merchant_id);

        // Fetch statuses and counts
        const [statusList, countData] = await Promise.all([
          fetchStatuses(),
          fetchDeliveryStatusCounts(merchant_id),
        ]);

        setStatuses(statusList);
        setCounts(countData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusClick = (statusId: number) => {
    const params = new URLSearchParams();
    params.set('status_ids', statusId.toString());
    if (merchantId) {
      params.set('merchant_id', merchantId.toString());
    }
    router.push(`/admin/delivery?${params.toString()}`);
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Хүргэлтийн төлөвийн хяналтын самбар
      </h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statuses.map((status) => {
            const borderColor = status.color || '#1890ff';
            const count = counts[status.id] || 0;
            
            return (
              <Card
                key={status.id}
                onClick={() => handleStatusClick(status.id)}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4"
                style={{
                  borderLeftColor: borderColor,
                }}
              >
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-base font-semibold">
                    {status.status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-6">
                  <div
                    className="text-4xl font-bold"
                    style={{ color: borderColor }}
                  >
                    {count}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}