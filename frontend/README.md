# LexiGo Frontend

Frontend độc lập với backend. Mọi lệnh trong tài liệu này chạy trực tiếp tại thư mục `frontend`.

## Cài đặt

```bat
copy .env.example .env
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173` và proxy `/api` sang backend tại `http://localhost:4010`.

## Lệnh chính

```bash
npm run dev
npm run build
npm run preview
npm run generate:api
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run check
```

## API contract độc lập

Frontend không còn phụ thuộc npm workspace `@lexigo/api-contracts`.

- Contract nguồn: `openapi/openapi.yaml`
- Type tự sinh: `src/api/generated/api-types.ts`
- Lệnh sinh type: `npm run generate:api`

Khi backend thay đổi OpenAPI, thay file `openapi/openapi.yaml`, sau đó chạy lại `npm run generate:api`.

## Tệp không chỉnh sửa thủ công

- `node_modules/`
- `package-lock.json` — npm tự tạo/cập nhật
- `dist/`
- `coverage/`
- `*.tsbuildinfo`
- `src/api/generated/api-types.ts`
- `.env`

## Docker

Dockerfile sử dụng chính thư mục `frontend` làm build context:

```bash
docker build -t lexigo-frontend .
docker run --rm -p 8080:80 -e BACKEND_UPSTREAM=host.docker.internal:4010 lexigo-frontend
```

Trong Docker Compose, backend nên có service name `backend`; giá trị mặc định là `BACKEND_UPSTREAM=backend:4010`.
