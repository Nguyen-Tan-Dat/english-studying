"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiRequest, getApiErrorMessage } from "@/lib/api";
import type { ResetPasswordResult } from "@/lib/types";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Đường dẫn không có reset token");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await apiRequest<ResetPasswordResult>("/api/users/reset-password", {
        method: "POST",
        body: { token, newPassword },
      });
      router.replace("/login?reset=1");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Đặt lại mật khẩu" description="Token chỉ dùng được một lần và có thời hạn.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {!token && <Alert variant="destructive">Thiếu token. Hãy mở đúng liên kết được tạo từ chức năng quên mật khẩu.</Alert>}
        {error && <Alert variant="destructive">{error}</Alert>}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <PasswordInput id="newPassword" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required />
          <p className="text-xs text-muted-foreground">Có chữ hoa, chữ thường và ít nhất một số.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <PasswordInput id="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading || !token}>
          {loading ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
          {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </Button>
        <p className="text-center text-sm text-muted-foreground"><Link href="/login" className="font-semibold text-primary hover:underline">Quay lại đăng nhập</Link></p>
      </form>
    </AuthShell>
  );
}
