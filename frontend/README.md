# LexiGo Frontend Full Demo v0.3.0

Frontend React/Vite độc lập, có `package.json` riêng và được nối với LexiGo Backend thông qua OpenAPI v0.9.0-rc.1.

## Chạy demo frontend + backend bằng một lệnh

Đặt hai thư mục cạnh nhau:

```text
project/
├── backend/
└── frontend/
```

Tại thư mục `frontend`:

```bat
npm install
npm run demo
```

`npm run demo` thực hiện tuần tự:

1. Tìm backend ở `../backend` hoặc đường dẫn `LEXIGO_BACKEND_DIR`.
2. Kiểm tra `http://localhost:4010/api/v1/health`.
3. Tự chạy `npm install` cho backend nếu chưa có `node_modules`.
4. Tạo `backend/.env` từ `.env.example` nếu cần.
5. Khởi động backend bằng `npm run dev`.
6. Chờ backend sẵn sàng.
7. Khởi động Vite, proxy `/api` sang backend và mở trình duyệt.
8. Dừng cả frontend và backend khi nhấn `Ctrl+C`.

Biến môi trường tùy chọn:

```bat
set LEXIGO_BACKEND_DIR=D:\Projects\LexiGo\backend
set LEXIGO_BACKEND_HEALTH_URL=http://localhost:4010/api/v1/health
set VITE_DEV_PROXY_TARGET=http://localhost:4010
npm run demo
```

## Tài khoản demo

```text
Learner: learner@lexigo.local / Demo123!
Admin:   admin@lexigo.local   / Admin123!
```

## UI đã triển khai

- Đăng ký, đăng nhập, refresh session, đăng xuất và hồ sơ.
- Dashboard tiến độ học.
- CRUD Topic Tree.
- Topic Tree Workspace, lazy-load children, tìm kiếm, CRUD Topic Node, move preview và move.
- CRUD từ vựng theo Topic, tìm kiếm toàn hệ thống và xem chi tiết.
- Publication preview, publish Tree/Branch, lịch sử và unpublish.
- Public Library, xem publication/node và clone.
- Collaboration: danh sách, mời, đổi quyền, thu hồi và nhận lời mời.
- Boolean Query: alias, parser, preview, CRUD Saved Query.
- Import Excel: policy, upload, validation preview và commit.
- Bảy chế độ Study, resume, answer, complete và pronunciation scoring.
- Operation tracking.
- Client Policy và trạng thái backend.
- Admin Dashboard, Default Tree, Content Health và Audit Log.

Toàn bộ **67/67 OpenAPI operations** có API client và điểm thao tác UI. Kiểm tra bằng:

```bash
npm run api:coverage
```

## Các lệnh package

```bash
npm run demo          # chạy frontend và tự khởi động/kết nối backend
npm run demo:check    # kiểm tra backend health
npm run dev           # chỉ chạy frontend
npm run build
npm run preview
npm run generate:api
npm run api:coverage
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run check
```

## API contract

- Contract nguồn: `openapi/openapi.yaml`
- Type raw tự sinh: `src/api/generated/api-types.ts`
- API facade sử dụng trong UI: `src/api/types.ts`

`src/api/generated/api-types.ts` là tệp tự sinh; không chỉnh sửa thủ công.

## Tệp tự sinh không đóng gói

- `node_modules/`
- `package-lock.json`
- `dist/`
- `coverage/`
- `*.tsbuildinfo`
- `src/api/generated/api-types.ts`
- `.env`

## Docker

```bash
docker build -t lexigo-frontend .
docker run --rm -p 8080:80 -e BACKEND_UPSTREAM=host.docker.internal:4010 lexigo-frontend
```
