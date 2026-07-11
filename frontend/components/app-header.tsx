"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAuthenticated, isHydrated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpenCheck className="size-5" />
          </span>
          <span className="hidden sm:inline">English Studying</span>
        </Link>

        {isHydrated && isAuthenticated && session ? (
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className={cn(
                "hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-muted sm:flex",
                pathname.startsWith("/admin") && "bg-muted",
              )}
            >
              <ShieldCheck className="size-4" /> Quản trị
            </Link>
            <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-1.5 md:flex">
              <UserRound className="size-4 text-muted-foreground" />
              <div className="leading-tight">
                <div className="text-xs font-semibold">{session.user.userName}</div>
                <div className="text-[11px] text-muted-foreground">{session.user.email}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Đăng xuất">
              <LogOut />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/login")}>Đăng nhập</Button>
            <Button onClick={() => router.push("/register")}>Đăng ký</Button>
          </div>
        )}
      </div>
    </header>
  );
}
