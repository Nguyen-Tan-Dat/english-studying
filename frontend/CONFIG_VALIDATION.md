# Frontend configuration validation

Đã kiểm tra cấu hình độc lập của frontend bằng các bước không cần tải dependency:

- JSON configuration parse: PASS
- OpenAPI YAML parse: PASS
- OpenAPI snapshot: 51 paths, 67 operations, 57 schemas
- TypeScript config parse (`tsc --showConfig`): PASS
- JavaScript/MJS syntax check: PASS
- Không còn dependency `@lexigo/api-contracts`: PASS
- `src/api/types.ts` dùng type sinh cục bộ: PASS
- Không đóng gói `node_modules`, `package-lock.json`, `dist`, `coverage`, `*.tsbuildinfo`, `vite.config.js`, `vite.config.d.ts`: PASS

Lệnh kiểm tra đầy đủ sau khi cài dependency:

```bash
npm install
npm run check
```

Môi trường đóng gói hiện tại không hoàn tất được bước tải dependency từ npm registry do kết nối registry bị timeout, vì vậy kết quả Vitest/ESLint/Vite build cần được chạy lại trên máy phát triển bằng lệnh trên.
