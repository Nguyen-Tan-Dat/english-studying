# Áp dụng frontend v0.3.0

## Cấu trúc khuyến nghị

```text
LexiGo/
├── backend/
└── frontend/
```

1. Sao lưu frontend hiện tại.
2. Chép toàn bộ nội dung gói này vào `frontend`.
3. Không chép lại `node_modules`, `dist`, `coverage`, `package-lock.json` hay file TypeScript tự sinh.
4. Đảm bảo backend có `package.json` độc lập.
5. Chạy:

```bat
cd frontend
copy .env.example .env
npm install
npm run demo
```

Backend ở vị trí khác:

```bat
set LEXIGO_BACKEND_DIR=D:\duong-dan\backend
npm run demo
```

Kiểm tra đầy đủ:

```bat
npm run api:coverage
npm run check
```
