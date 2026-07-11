import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "English Studying",
    template: "%s | English Studying",
  },
  description: "Ứng dụng học tiếng Anh với xác thực và quản trị RBAC.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
