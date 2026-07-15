# Áp dụng cấu hình vào frontend hiện tại

1. Sao lưu thư mục frontend hiện tại.
2. Chép đè toàn bộ tệp trong gói cấu hình vào thư mục `frontend`.
3. Xóa các tệp cũ do TypeScript/Vite tự sinh:

```bat
rmdir /S /Q node_modules
rmdir /S /Q dist
rmdir /S /Q coverage
del /Q package-lock.json
del /Q *.tsbuildinfo
del /Q vite.config.js
del /Q vite.config.d.ts
```

4. Bảo đảm `src/api/types.ts` dùng import sau:

```ts
import type { components } from './generated/api-types';
```

5. Chạy:

```bat
copy .env.example .env
npm install
npm run check
npm run dev
```
