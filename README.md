# English Studying

Monorepo ứng dụng học tiếng Anh với quản lý người dùng, phân quyền RBAC, từ vựng và lịch ôn tập SRS (Spaced Repetition System).

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL |
| ORM / Query | Kysely |
| Auth | JWT, bcrypt |
| Testing | Vitest, Supertest |
| CI | GitHub Actions |

## Cấu trúc monorepo

```
english-studying/
├── backend/     # REST API — xem backend/README.md
├── frontend/    # Web app — xem frontend/README.md
└── README.md    # Tổng quan dự án (file này)
```

## Chức năng

### Xác thực người dùng

- Đăng ký tài khoản (email, username, password, PIN)
- Đăng nhập bằng email hoặc username
- Quên mật khẩu và đặt lại mật khẩu qua token một lần
- Mật khẩu và PIN lưu dạng bcrypt hash; reset token chỉ lưu SHA-256 hash

**API:** `POST /api/users/register`, `/login`, `/forgot-password`, `/reset-password`

### Phân quyền RBAC (Admin)

- Quản lý roles và permissions theo mô hình `<table>.<action>` (create, read, update, delete)
- Role `super_admin` được bảo vệ, không thể xóa hoặc sửa qua API
- 56 permissions mặc định (4 CRUD × 14 bảng)

**API:** `GET/POST/PATCH/DELETE /api/admin/roles`, `GET /api/admin/permissions`, `PUT /api/admin/roles/:id/permissions`

### Từ vựng & SRS

- CRUD từ vựng cá nhân
- Danh sách từ cần ôn tập hôm nay
- Chấm điểm ôn tập và cập nhật lịch SRS tự động

**API:** `GET/POST /api/vocabularies`, `GET /api/vocabularies/due`, `POST /api/vocabularies/:id/review`

### Frontend

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ |
| `/register` | Đăng ký |
| `/login` | Đăng nhập |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password?token=...` | Đặt lại mật khẩu |
| `/admin` | Quản lý roles & permissions (yêu cầu `super_admin`) |

JWT lưu trong `localStorage`; tự xóa khi hết hạn hoặc backend trả `401`.

## API Endpoints

### Health

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/health` | Không | Kiểm tra API và kết nối PostgreSQL |

### Auth (legacy)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/login` | Không | Đăng nhập, trả JWT |

### Users

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/users/register` | Không | Đăng ký tài khoản mới |
| POST | `/api/users/login` | Không | Đăng nhập |
| POST | `/api/users/forgot-password` | Không | Yêu cầu reset mật khẩu |
| POST | `/api/users/reset-password` | Không | Đặt lại mật khẩu |

**Register body:**

```json
{
  "email": "dat@example.com",
  "userName": "nguyentandat",
  "password": "StrongPass123",
  "pin": "1234"
}
```

**Login body:**

```json
{
  "identifier": "dat@example.com",
  "password": "StrongPass123"
}
```

### Admin RBAC

Tất cả endpoint yêu cầu `Authorization: Bearer <token>` và permission tương ứng.

| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/api/admin/permissions` | `permissions.read` | Danh sách permissions |
| GET | `/api/admin/roles` | `roles.read` | Danh sách roles |
| GET | `/api/admin/roles/:id` | `roles.read` | Chi tiết role |
| POST | `/api/admin/roles` | `roles.create` | Tạo role |
| PATCH | `/api/admin/roles/:id` | `roles.update` | Cập nhật role |
| PUT | `/api/admin/roles/:id/permissions` | `role_permissions.update` | Gán permissions |
| DELETE | `/api/admin/roles/:id` | `roles.delete` | Xóa role |

### Vocabulary

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/vocabularies` | Bearer JWT | Danh sách từ vựng |
| GET | `/api/vocabularies/due` | Bearer JWT | Từ cần ôn hôm nay |
| POST | `/api/vocabularies` | Bearer JWT | Thêm từ mới |
| POST | `/api/vocabularies/:id/review` | Bearer JWT | Chấm điểm ôn tập SRS |

## Yêu cầu hệ thống

- Node.js 22+ (frontend), Node.js 18+ (backend)
- PostgreSQL 17 (khuyến nghị)

## Quick start

```powershell
# 1. Backend
cd backend
Copy-Item .env.example .env
# Sửa DATABASE_URL trong .env
npm install
npm run db:check
npm run dev

# 2. Frontend (terminal mới)
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

Chi tiết setup, cấu trúc thư mục và lệnh chạy xem:

- [backend/README.md](./backend/README.md)
- [frontend/README.md](./frontend/README.md)

## Chuẩn bị tài khoản admin

```powershell
cd backend
npm run db:seed:rbac
npm run db:grant-super-admin -- admin@example.com
```

Sau đó đăng nhập frontend và mở `/admin`.
