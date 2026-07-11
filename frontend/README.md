# Frontend

Web app Next.js 16 kết nối backend Express/PostgreSQL.

## Cấu trúc dự án

```
frontend/
├── app/                          # App Router (Next.js)
│   ├── page.tsx                  # Trang chủ
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Context providers
│   ├── login/                    # Đăng nhập
│   ├── register/                 # Đăng ký
│   ├── forgot-password/          # Quên mật khẩu
│   ├── reset-password/           # Đặt lại mật khẩu
│   ├── admin/                    # Quản lý RBAC
│   └── not-found.tsx             # Trang 404
├── components/
│   ├── admin/                    # Admin UI (role manager)
│   ├── auth/                     # Auth shell, forms
│   ├── ui/                       # UI components (button, input, card...)
│   ├── app-header.tsx
│   ├── password-input.tsx
│   └── protected-page.tsx
├── contexts/
│   └── auth-context.tsx          # JWT session state
├── lib/
│   ├── api.ts                    # HTTP client gọi backend
│   ├── types.ts                  # TypeScript types
│   └── utils.ts
├── public/
├── .env.local.example
└── package.json
```

## Setup

### 1. Cấu hình môi trường

```powershell
Copy-Item .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Backend chạy cổng `3000`; frontend mặc định cổng `3001`.

Trong `backend/.env`, nên đặt:

```env
PASSWORD_RESET_URL=http://localhost:3001/reset-password
RETURN_PASSWORD_RESET_TOKEN=true
```

### 2. Cài đặt dependencies

```powershell
npm install
```

Yêu cầu Node.js 22+.

## Chạy

```powershell
# Development
npm run dev

# Production
npm run build
npm start
```

Mở http://localhost:3001

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Development server (port 3001) |
| `npm run build` | Build production |
| `npm start` | Chạy bản build |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | ESLint |

## Chuẩn bị tài khoản admin

Ở thư mục backend:

```powershell
npm run db:seed:rbac
npm run db:grant-super-admin -- admin@example.com
```

Đăng nhập frontend bằng tài khoản được gán `super_admin`, sau đó mở `/admin`.

## Bảo mật

Frontend lưu access token trong `localStorage` vì backend trả JWT trực tiếp. Với production, nên nâng cấp sang cookie `HttpOnly`, `Secure`, `SameSite` và CSRF protection.
