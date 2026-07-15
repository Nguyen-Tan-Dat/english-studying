# Backend configuration validation

Đã kiểm tra trên Node.js 22 và npm 10 bằng lệnh:

```bash
npm run check
```

Kết quả:

- TypeScript application type-check: PASS
- TypeScript test configuration type-check: PASS
- ESLint: PASS
- Vitest: 18 test files, 20 tests PASS
- Production build: PASS
- SQL migrations/seeds copy to `dist/`: PASS
