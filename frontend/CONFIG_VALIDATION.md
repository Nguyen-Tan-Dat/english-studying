# Frontend v0.3.0 validation

## Đã đạt

- JSON configuration parse: PASS.
- OpenAPI parse: PASS — 51 paths, 67 operations, 57 schemas.
- UI/API operation mapping: PASS — 67/67.
- `demo.mjs`, `demo-health.mjs`, `clean.mjs`, `validate-ui-coverage.mjs`: syntax PASS.
- TypeScript application/test/config source check: PASS bằng TypeScript 5.8 với declaration compatibility stubs.
- `noUnusedLocals` và `noUnusedParameters`: PASS.
- Không còn npm workspace dependency: PASS.
- `frontend/package.json` có lệnh `npm run demo` tự tìm, khởi động và chờ backend: PASS.
- Không đóng gói các file tự sinh: PASS.

## Cần chạy trên máy phát triển

Môi trường đóng gói bị timeout khi tải dependency từ npm registry, nên ESLint, Vitest và Vite production build với dependency thật cần xác nhận lại bằng:

```bash
npm install
npm run check
```

Điều này không ảnh hưởng đến source/config đã tạo, nhưng không được xem là kết quả build production đã xác nhận trong môi trường đóng gói hiện tại.
