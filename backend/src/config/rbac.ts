export const CRUD_ACTIONS = ["create", "read", "update", "delete"] as const;

export const RBAC_TABLES = [
  "users",
  "tokens",
  "roles",
  "permissions",
  "role_permissions",
  "user_roles",
  "english_words",
  "vietnamese_meanings",
  "user_vocabularies",
  "review_logs",
  "reading_materials",
  "reading_annotations",
  "reading_reflections",
  "daily_journals",
] as const;

export type CrudAction = (typeof CRUD_ACTIONS)[number];
export type RbacTable = (typeof RBAC_TABLES)[number];
export type PermissionName = `${RbacTable}.${CrudAction}`;

export const SYSTEM_PERMISSION_NAMES: PermissionName[] = RBAC_TABLES.flatMap(
  (tableName) =>
    CRUD_ACTIONS.map((action): PermissionName => `${tableName}.${action}`),
);

export function isPermissionName(value: string): value is PermissionName {
  return SYSTEM_PERMISSION_NAMES.includes(value as PermissionName);
}
