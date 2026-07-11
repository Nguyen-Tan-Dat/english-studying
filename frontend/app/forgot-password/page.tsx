"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Copy, KeyRound, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, getApiErrorMessage } from "@/lib/api";
import type { ForgotPasswordResult } from "@/lib/types";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await apiRequest<ForgotPasswordResult>("/api/users/forgot-password", {
        method: "POST",
        body: { email },
      });
      setResult(response);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const localResetUrl =
    result?.development && typeof window !== "undefined"
      ? `${window.location.origin}/reset-password?token=${encodeURIComponent(result.development.resetToken)}`
      : null;

  return (
    <AuthShell title="Quên mật khẩu" description="Yêu cầu một đường dẫn đặt lại mật khẩu dùng một lần.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="destructive">{error}</Alert>}
        {result && <Alert variant="success">{result.message}</Alert>}
        <div className="space-y-2">
          <Label htmlFor="email">Email tài khoản</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
          {loading ? "Đang tạo yêu cầu..." : "Gửi yêu cầu"}
        </Button>
      </form>

      {result?.development && localResetUrl && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Chế độ development</p>
          <p className="mt-1 text-xs">Backend đang trả reset token trực tiếp. Production phải gửi đường dẫn này qua email.</p>
          <div className="mt-3 flex gap-2">
            <Link href={`/reset-password?token=${encodeURIComponent(result.development.resetToken)}`} className="flex-1">
              <Button className="w-full" size="sm">Mở trang đặt lại</Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(localResetUrl);
                setCopied(true);
              }}
            >
              <Copy /> {copied ? "Đã chép" : "Sao chép"}
            </Button>
          </div>
          <p className="mt-2 text-xs">Hết hạn: {new Date(result.development.expiresAt).toLocaleString("vi-VN")}</p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground"><Link href="/login" className="font-semibold text-primary hover:underline">Quay lại đăng nhập</Link></p>
    </AuthShell>
  );
}
