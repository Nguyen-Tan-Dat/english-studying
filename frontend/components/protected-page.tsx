"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login?next=/admin");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" /> Đang kiểm tra phiên đăng nhập...
        </div>
      </main>
    );
  }

  return children;
}
