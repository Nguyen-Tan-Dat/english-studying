"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Database,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, getApiErrorMessage } from "@/lib/api";

interface HealthResult {
  status: string;
  database: string;
  timestamp: string;
}

export default function HomePage() {
  const { isAuthenticated, session } = useAuth();
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<HealthResult>("/health")
      .then(setHealth)
      .catch((error) => setHealthError(getApiErrorMessage(error)));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.17),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.14),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-5">Backend + Frontend đã kết nối</Badge>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Hệ thống học tiếng Anh có xác thực và phân quyền rõ ràng.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Đăng ký tài khoản, đăng nhập bằng email hoặc username, khôi phục mật khẩu và quản trị role/permission theo mô hình RBAC.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <>
                    <Button size="lg" onClick={() => { window.location.href = "/admin"; }}>
                      Mở trang quản trị <ArrowRight />
                    </Button>
                    <div className="flex items-center rounded-xl border bg-card px-4 text-sm">
                      Xin chào, <strong className="ml-1">{session?.user.userName}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/register"><Button size="lg">Tạo tài khoản <ArrowRight /></Button></Link>
                    <Link href="/login"><Button size="lg" variant="outline">Đăng nhập</Button></Link>
                  </>
                )}
              </div>
            </div>

            <Card className="self-center bg-card/90 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database /> Trạng thái backend</CardTitle>
                <CardDescription>Kiểm tra trực tiếp endpoint `/health`.</CardDescription>
              </CardHeader>
              <CardContent>
                {health ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-emerald-800">
                      <span className="flex items-center gap-2 font-semibold"><CheckCircle2 /> API</span>
                      <Badge variant="success">{health.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                      <span>PostgreSQL</span>
                      <strong>{health.database}</strong>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cập nhật: {new Date(health.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ) : healthError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{healthError}</div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" /> Đang kết nối...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [BookOpen, "Tài khoản người học", "Đăng ký, đăng nhập và duy trì phiên JWT."],
              [BrainCircuit, "Khôi phục an toàn", "Reset token dùng một lần và tự hết hạn."],
              [ShieldCheck, "Admin RBAC", "CRUD roles và gán permissions theo từng bảng."],
            ].map(([Icon, title, description]) => {
              const IconComponent = Icon as typeof BookOpen;
              return (
                <Card key={String(title)}>
                  <CardHeader>
                    <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><IconComponent /></span>
                    <CardTitle>{String(title)}</CardTitle>
                    <CardDescription>{String(description)}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
