# English Studying - User Management

Monorepo quản lý người dùng với Next.js (frontend) và Express + Prisma + PostgreSQL (backend).

## Cấu trúc thư mục

```
english-studying/
├── backend/          # Node.js + Express + Prisma
│   ├── prisma/
│   ├── src/
│   └── package.json
└── frontend/         # Next.js + Tailwind CSS
    ├── pages/
    ├── components/
    └── package.json
```

## Yêu cầu

- Node.js 18+
- PostgreSQL đang chạy local (hoặc remote)

## Cài đặt

### 1. Backend

```bash
cd backend
cp .env.example .env
# Sửa DATABASE_URL trong .env cho đúng PostgreSQL của bạn
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend chạy tại: http://localhost:5000

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend chạy tại: http://localhost:3000

## API Endpoints

| Method | Endpoint        | Mô tả              |
|--------|-----------------|--------------------|
| GET    | /api/users      | Lấy danh sách user |
| POST   | /api/users      | Tạo user mới       |
| GET    | /api/users/:id  | Lấy user theo id   |
| PUT    | /api/users/:id  | Cập nhật user      |
| DELETE | /api/users/:id  | Xóa user           |

## Lưu ý

- Mật khẩu hiện lưu dạng plain text (demo). Trong production nên hash bằng bcrypt.
- Cập nhật `DATABASE_URL` trong `backend/.env` trước khi chạy migration.
