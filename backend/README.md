# Backend

REST API Express + TypeScript kết nối PostgreSQL qua Kysely. Kiến trúc 3 lớp: Route → Controller → Service.

## Cấu trúc dự án

```
backend/
├── src/
│   ├── app.ts                    # Cấu hình Express
│   ├── server.ts                 # Khởi động HTTP server và pool DB
│   ├── config/
│   │   ├── env.ts                # Biến môi trường
│   │   └── rbac.ts               # Cấu hình RBAC
│   ├── database/
│   │   ├── db.ts                 # PostgreSQL pool + Kysely
│   │   ├── types.ts              # Schema typed
│   │   ├── schema/tables.sql     # DDL tạo bảng
│   │   ├── migrations/           # Migration bổ sung
│   │   ├── seed-rbac.ts          # Seed roles & permissions
│   │   └── grant-super-admin.ts  # Gán super_admin cho user
│   ├── routes/                   # Định nghĩa endpoint
│   ├── controllers/              # Xử lý request/response
│   ├── services/                 # Business logic & DB operations
│   ├── middlewares/              # Auth, permission, error handling
│   ├── utils/
│   └── types/
├── tests/
│   ├── unit/                     # Unit tests (SRS)
│   ├── integration/              # API integration tests
│   ├── helpers/
│   ├── scripts/                  # Reset test database
│   └── setup/
├── .env.example
├── .env.test.example
└── package.json
```

### Luồng xử lý request

```
Client → Route → Middleware → Controller → Service → Kysely/PostgreSQL → Response
```

## Setup

### 1. Tạo database

```powershell
createdb -U postgres english_learning
psql -U postgres -d english_learning -f src/database/schema/tables.sql
```

### 2. Cấu hình `.env`

```powershell
Copy-Item .env.example .env
```

Các biến quan trọng:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/english_learning
DB_SSL=false

JWT_SECRET=replace-with-a-long-random-secret
JWT_ISSUER=english-learning-api
JWT_AUDIENCE=english-learning-client
JWT_EXPIRES_IN_SECONDS=604800

BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES=15
PASSWORD_RESET_URL=http://localhost:3001/reset-password
RETURN_PASSWORD_RESET_TOKEN=true
```

- `RETURN_PASSWORD_RESET_TOKEN=true` chỉ dùng khi development.
- Với PostgreSQL hosted yêu cầu TLS, đặt `DB_SSL=true`.
- Có thể dùng `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` thay cho `DATABASE_URL`.

### 3. Cài đặt dependencies

```powershell
npm install
npm run build
npm run db:check
```

### 4. Khởi tạo RBAC

```powershell
npm run db:seed:rbac
npm run db:grant-super-admin -- admin@example.com
```

Tài khoản phải đã tồn tại trong bảng `users`.

### 5. Migration (database cũ)

Nếu database đã tồn tại trước khi có API auth:

```powershell
psql -U postgres -d english_learning -f "src/database/migrations/001_users_auth_indexes.sql"
```

## Chạy

```powershell
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

Server mặc định: http://localhost:3000

Server kiểm tra PostgreSQL trước khi mở cổng HTTP và đóng pool gracefully khi nhận `SIGINT`/`SIGTERM`.

## Scripts hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy development với nodemon |
| `npm run build` | Compile TypeScript |
| `npm start` | Chạy bản build |
| `npm run db:check` | Kiểm tra kết nối PostgreSQL |
| `npm run db:seed:rbac` | Seed roles & permissions |
| `npm run db:grant-super-admin -- <email>` | Gán role super_admin |
| `npm run lint` | ESLint |
| `npm run typecheck` | Kiểm tra TypeScript |

## Testing

Dùng Vitest + Supertest với database PostgreSQL riêng cho test.

### Cấu hình lần đầu

```powershell
Copy-Item .env.test.example .env.test
```

```env
TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/english_learning_test
```

Database test **phải** có tên kết thúc bằng `_test`. Không trỏ `TEST_DATABASE_URL` vào database dev/production.

### Chạy tests

```powershell
npm test                  # Reset DB + chạy toàn bộ
npm run test:unit         # Unit tests (không cần PostgreSQL)
npm run test:integration  # Integration tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report → coverage/index.html
```

CI chạy tự động qua `.github/workflows/backend-tests.yml` trên push/PR.

## Thêm module mới

Theo cùng pattern 3 lớp:

```
routes/<module>.routes.ts
controllers/<module>.controller.ts
services/<module>.service.ts
```

Đăng ký router trong `routes/index.ts`. Không thêm business logic vào `app.ts`.
