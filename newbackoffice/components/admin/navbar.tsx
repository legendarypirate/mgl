"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";

function getUserName(): string {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "Хэрэглэгч";
    const user = JSON.parse(userStr);
    return user.name || user.username || "Хэрэглэгч";
  } catch {
    return "Хэрэглэгч";
  }
}

export function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Хэрэглэгч");
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    setUserName(getUserName());
  }, []);

  const handleLogout = () => {
    toast.success("Амжилттай гарлаа");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLogoutOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="border-b p-4 flex items-center justify-between bg-background">
        <h2 className="font-semibold">Dashboard</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Таны нэр: {userName}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Гарах</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Та гарахдаа итгэлтэй байна уу?</DialogTitle>
            <DialogDescription>
              Та системээс гарахдаа итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Үгүй
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Тийм
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
