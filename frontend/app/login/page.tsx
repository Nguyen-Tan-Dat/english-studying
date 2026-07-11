"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorMessage } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") ? next : "/");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Đăng nhập" description="Sử dụng email hoặc username của bạn.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {searchParams.get("registered") === "1" && (
          <Alert variant="success">Đăng ký thành công. Bạn có thể đăng nhập ngay.</Alert>
        )}
        {searchParams.get("reset") === "1" && (
          <Alert variant="success">Mật khẩu đã được đặt lại. Hãy đăng nhập bằng mật khẩu mới.</Alert>
        )}
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="space-y-2">
          <Label htmlFor="identifier">Email hoặc username</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="dat@example.com hoặc nguyentandat"
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">Quên mật khẩu?</Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <LogIn />}
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link href="/register" className="font-semibold text-primary hover:underline">Đăng ký</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
