# UI/API Coverage

OpenAPI snapshot: **51 paths, 67 operations, 57 schemas**.

| Nhóm | Operations | Giao diện |
|---|---:|---|
| System | 2 | `/system` |
| Auth | 4 | `/login`, `/register`, AuthProvider, Header |
| User | 3 | `/profile`, `/dashboard` |
| Topic Trees & Nodes | 15 | `/trees`, `/trees/:treeId` |
| Vocabulary | 6 | Workspace Vocabulary, `/vocabulary` |
| Publishing & Public Library | 8 | Workspace Publishing, `/library` |
| Collaboration | 5 | Workspace Collaboration, invitation route |
| Boolean Queries | 7 | `/queries` |
| Excel Import | 5 | Workspace Import |
| Study & Pronunciation | 6 | `/study` |
| Operations | 1 | `/operations` |
| Admin | 5 | `/admin` |
| **Tổng** | **67** | **67/67 mapped** |

`npm run api:coverage` đọc toàn bộ `operationId` trong OpenAPI và thất bại nếu có operation chưa được ánh xạ vào UI.
