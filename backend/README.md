# LexiGo Backend

Backend độc lập với frontend. Mọi lệnh trong tài liệu này chạy trực tiếp tại thư mục `backend`.

## Cài đặt

```bash
copy .env.example .env
npm install
npm run dev
```

API mặc định chạy tại `http://localhost:4010/api/v1`.

## Lệnh chính

```bash
npm run dev
npm run build
npm start
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run check
npm run db:migrate
npm run db:seed
```

## Tệp không chỉnh sửa thủ công

- `node_modules/`
- `package-lock.json` — npm tự tạo/cập nhật
- `dist/`
- `coverage/`
- `*.tsbuildinfo`

## Docker

Dockerfile sử dụng thư mục `backend` làm build context:

```bash
docker build -t lexigo-backend .
docker run --env-file .env -p 4010:4010 lexigo-backend
```
