import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_34%)]" />
      <div className="w-full max-w-md">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2 font-bold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <BookOpenCheck className="size-5" />
          </span>
          <span className="text-lg">English Studying</span>
        </Link>
        <Card className="overflow-hidden bg-card/95 shadow-xl backdrop-blur">
          <div className="border-b bg-muted/40 px-6 py-5">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="p-6">{children}</div>
        </Card>
      </div>
    </main>
  );
}
