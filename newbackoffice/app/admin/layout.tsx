"use client";

import React, { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MenuItemType {
  key: string;
  icon?: React.ReactNode;
  label: string;
  permission?: string;
  children?: MenuItemType[];
}

function getUserPermissions(): string[] {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);
    return user.permissions || [];
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return [];
  }
}

function hasAccessToPath(
  pathname: string,
  menuItems: MenuItemType[],
  userPermissions: string[]
): boolean {
  // Allow access to /admin root without specific permission check
  if (pathname === "/admin") {
    return true;
  }

  for (const item of menuItems) {
    // Exact match
    if (item.key === pathname) {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    }
    // Check children recursively
    if (item.children && hasAccessToPath(pathname, item.children, userPermissions)) {
      return true;
    }
  }
  return false;
}

const menuItems: MenuItemType[] = [
  { key: "/admin", label: "Хянах самбар", permission: "dashboard:view_dashboard" },
  { key: "/admin/delivery", label: "Хүргэлт", permission: "delivery:view_delivery" },
  { key: "/admin/order", label: "Татан авалт", permission: "order:view_order" },
  { key: "/admin/region", label: "Бүс", permission: "region:view_region" },
  { key: "/admin/notification", label: "Масс мэдэгдэл", permission: "notification:view_notification" },
  {
    key: "good",
    label: "Агуулахын бараа",
    permission: "good:view_good",
    children: [
      { key: "/admin/good", label: "Барааны жагсаалт", permission: "good:view_good" },
      { key: "/admin/good-request", label: "Барааны хүсэлт", permission: "good:view_good" },
    ],
  },
  {
    key: "report",
    label: "Тайлан",
    permission: "reports:view_reports",
    children: [
      { key: "/admin/report", label: "Тайлан", permission: "reports:view_reports" },
      { key: "/admin/report/product", label: "Барааны тайлан", permission: "reports:view_reports" },
    ],
  },
  { key: "/admin/log", label: "Үйлдлийн лог", permission: "log:view_log" },
  {
    key: "user",
    label: "Хэрэглэгч",
    permission: "log:view_log",
    children: [
      { key: "/admin/user", label: "Харилцагч нар", permission: "log:view_log" },
      { key: "/admin/request", label: "Жолооч", permission: "log:view_log" },
    ],
  },
  {
    key: "settings",
    label: "Тохиргоо",
    permission: "settings:view_settings",
    children: [
      { key: "/admin/status", label: "Хүргэлтийн төлөвүүд", permission: "status:view_status" },
      { key: "/admin/role", label: "Эрхийн зохицуулалт", permission: "role:view_role" },
      { key: "/admin/warehouse", label: "Агуулах бүртгэх", permission: "warehouse:view_warehouse" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userPermissions, setUserPermissions] = useState<string[] | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const permissions = getUserPermissions();
    setUserPermissions(permissions);
    setIsChecking(false);
    
    // Listen for storage changes to update permissions
    const handleStorageChange = () => {
      const updatedPermissions = getUserPermissions();
      setUserPermissions(updatedPermissions);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ------------------------ ROUTE ACCESS CONTROL ------------------------ */
  useEffect(() => {
    // If permissions not loaded yet, skip
    if (userPermissions === null || isChecking) return;

    // Always read fresh permissions from localStorage to avoid stale data
    const freshPermissions = getUserPermissions();
    
    // Update state if permissions changed
    if (JSON.stringify(freshPermissions) !== JSON.stringify(userPermissions)) {
      setUserPermissions(freshPermissions);
      return; // Re-run effect with updated permissions
    }

    // Block unauthenticated users
    if (freshPermissions.length === 0 && pathname.startsWith("/admin")) {
      toast.error("Та эхлээд нэвтэрнэ үү!");
      router.push("/");
      return;
    }

    // Block users without permission
    const allowed = hasAccessToPath(pathname, menuItems, freshPermissions);
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Access check:", {
        pathname,
        allowed,
        freshPermissions,
        pathMatches: menuItems.some(item => 
          item.key === pathname || 
          item.children?.some(child => child.key === pathname)
        )
      });
    }
    
    if (pathname.startsWith("/admin") && !allowed) {
      // Only show error if we're not already on /admin (to avoid redirect loops)
      if (pathname !== "/admin") {
        console.warn("Access denied for path:", pathname, "Permissions:", freshPermissions);
        toast.error("Танд энэ хуудас руу хандах эрх байхгүй!");
        router.push("/admin");
      }
    }
  }, [pathname, userPermissions, router, isChecking]);

  return (
    <div className="flex min-h-screen bg-muted/10">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          {(loading || isPending) ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
