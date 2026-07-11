import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "destructive";
}

function Alert({ className, variant = "info", children, ...props }: AlertProps) {
  const Icon = variant === "success" ? CheckCircle2 : variant === "destructive" ? AlertCircle : Info;
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-3.5 text-sm",
        variant === "info" && "border-blue-200 bg-blue-50 text-blue-800",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        variant === "destructive" && "border-red-200 bg-red-50 text-red-800",
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export { Alert };
