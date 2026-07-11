"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, getApiErrorMessage } from "@/lib/api";
import type { RegisterResult } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", userName: "", password: "", confirmPassword: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await apiRequest<RegisterResult>("/api/users/register", {
        method: "POST",
        body: {
          email: form.email,
          userName: form.userName,
          password: form.password,
          pin: form.pin,
        },
      });
      router.replace("/login?registered=1");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Tạo tài khoản" description="Tài khoản mới sẽ tự nhận role người dùng mặc định.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="destructive">{error}</Alert>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userName">Username</Label>
          <Input id="userName" value={form.userName} onChange={(e) => update("userName", e.target.value.toLowerCase())} placeholder="chữ thường, số, dấu chấm hoặc gạch dưới" minLength={3} maxLength={50} autoComplete="username" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <PasswordInput id="password" value={form.password} onChange={(e) => update("password", e.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required />
          <p className="text-xs text-muted-foreground">8–72 ký tự, có chữ hoa, chữ thường và số.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pin">PIN</Label>
          <Input id="pin" type="password" inputMode="numeric" pattern="[0-9]{4,12}" value={form.pin} onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))} minLength={4} maxLength={12} autoComplete="off" required />
          <p className="text-xs text-muted-foreground">Từ 4 đến 12 chữ số.</p>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <UserPlus />}
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">Đã có tài khoản? <Link href="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link></p>
      </form>
    </AuthShell>
  );
}
