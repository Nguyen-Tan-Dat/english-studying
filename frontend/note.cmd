================================================================================
FRONTEND — Ghi chú setup (english-studying)
Windows | Node.js 22+ | Next.js 16
================================================================================

1. Tạo project (từ thư mục gốc repo)
------------------------------------
npx create-next-app@latest frontend --typescript --tailwind --eslint
→ Chọn App Router: Yes

cd frontend

2. Shadcn/ui
------------
npx shadcn@latest init
→ Dùng shadcn@latest, không dùng shadcn-ui (deprecated)

npx shadcn@latest add button card badge input label textarea alert

3. Cấu hình
-----------
Copy-Item .env.local.example .env.local

.env.local:
  NEXT_PUBLIC_API_URL=http://localhost:3000

Port frontend cố định 3001 (backend dùng 3000):
  "dev": "next dev -p 3001"

Backend .env (cho reset password):
  PASSWORD_RESET_URL=http://localhost:3001/reset-password
  RETURN_PASSWORD_RESET_TOKEN=true

4. Chạy
-------
npm install
npm run dev          → http://localhost:3001
npm run typecheck
npm run build

5. Lỗi thường gặp
-----------------
- Module not found @/components/ui/... → chạy npx shadcn@latest add <component>
- shadcn-ui deprecated → dùng npx shadcn@latest
- Không kết nối backend → kiểm tra backend đang chạy cổng 3000

Chi tiết: README.md
