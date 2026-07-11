================================================================================
BACKEND — Ghi chú setup (english-studying)
Windows | Node.js 18+ | PostgreSQL 17
================================================================================

1. Khởi tạo
-----------
cd backend
npm init -y

2. Dependencies
---------------
npm install express dotenv cors helmet compression pg kysely bcryptjs jsonwebtoken

npm install -D typescript@~5.7.0 @types/node @types/express @types/cors @types/helmet @types/compression @types/pg @types/jsonwebtoken ts-node nodemon rimraf

npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier

npm install -D vitest @vitest/coverage-v8 supertest @types/supertest

3. TypeScript
-------------
npx tsc --init
→ outDir: ./dist, rootDir: ./src, module: commonjs, strict: true
→ verbatimModuleSyntax: false (bắt buộc khi dùng CommonJS + ts-node)

4. Database
-----------
createdb -U postgres english_learning
psql -U postgres -d english_learning -f src/database/schema/tables.sql

Copy-Item .env.example .env
→ Sửa DATABASE_URL, JWT_SECRET

npm run db:check
npm run db:seed:rbac
npm run db:grant-super-admin -- admin@example.com

5. Chạy
-------
npm install
npm run dev          → http://localhost:3000
npm test             → cần .env.test (Copy-Item .env.test.example .env.test)

6. Lỗi thường gặp
-----------------
- ESLint peer dependency: dùng typescript@~5.7.0, không dùng TS 7.x
- verbatimModuleSyntax: đặt false trong tsconfig.json
- Test DB: tên database phải kết thúc bằng _test

Chi tiết: README.md
