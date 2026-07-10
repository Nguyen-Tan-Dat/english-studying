# Admin Roles & Permissions API

The project uses role-based access control (RBAC). Permission names follow this format:

```text
<table>.<action>
```

Examples:

```text
roles.read
roles.create
role_permissions.update
users.delete
english_words.update
```

Four permissions are generated for every database table:

```text
create
read
update
delete
```

## 1. Initialize RBAC

Run this after importing `src/database/schema/tables.sql`:

```powershell
npm run db:seed:rbac
```

This command is idempotent. It creates or updates:

- 56 permissions: 4 CRUD actions × 14 tables.
- The protected `super_admin` role.
- Every permission assignment for `super_admin`.

Then grant the role to an existing account:

```powershell
npm run db:grant-super-admin -- admin@example.com
```

A username can be supplied instead of an email address.

## 2. Authentication

All `/api/admin/*` endpoints require a valid access token:

```http
Authorization: Bearer <access-token>
```

The authenticated user must also possess the permission required by the endpoint.

## 3. Endpoints

| Method | Endpoint                           | Required permission       | Purpose                                    |
| ------ | ---------------------------------- | ------------------------- | ------------------------------------------ |
| GET    | `/api/admin/permissions`           | `permissions.read`        | List available permissions                 |
| GET    | `/api/admin/roles`                 | `roles.read`              | List roles and their permissions           |
| GET    | `/api/admin/roles/:id`             | `roles.read`              | Read one role                              |
| POST   | `/api/admin/roles`                 | `roles.create`            | Create a role                              |
| PATCH  | `/api/admin/roles/:id`             | `roles.update`            | Rename or describe a role                  |
| PUT    | `/api/admin/roles/:id/permissions` | `role_permissions.update` | Replace all permissions assigned to a role |
| DELETE | `/api/admin/roles/:id`             | `roles.delete`            | Delete a role                              |

## 4. Create a role

```http
POST /api/admin/roles
Content-Type: application/json
Authorization: Bearer <access-token>
```

```json
{
  "name": "vocabulary_manager",
  "description": "Manages dictionary and vocabulary records",
  "permissionNames": [
    "english_words.create",
    "english_words.read",
    "english_words.update",
    "english_words.delete",
    "vietnamese_meanings.create",
    "vietnamese_meanings.read",
    "vietnamese_meanings.update",
    "vietnamese_meanings.delete"
  ]
}
```

Role names are normalized to lowercase and must use letters, numbers, and underscores.

## 5. Update role information

```http
PATCH /api/admin/roles/2
```

```json
{
  "description": "Updated description"
}
```

Use `null` to clear a description.

## 6. Replace role permissions

```http
PUT /api/admin/roles/2/permissions
```

```json
{
  "permissionNames": ["english_words.read", "english_words.update"]
}
```

This operation runs in a transaction. Existing assignments are removed and replaced only after all supplied permission names have been validated.

## 7. Protected role

`super_admin` cannot be renamed, deleted, or edited through the permission replacement endpoint. Re-run `npm run db:seed:rbac` whenever new tables or permissions are added.
