"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { ApiClientError, apiRequest, getApiErrorMessage } from "@/lib/api";
import type { Permission, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditorState {
  id: string | null;
  name: string;
  description: string;
  permissionNames: string[];
}

const EMPTY_EDITOR: EditorState = {
  id: null,
  name: "",
  description: "",
  permissionNames: [],
};

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function RoleManager() {
  const { session } = useAuth();
  const token = session?.accessToken ?? "";
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editor, setEditor] = useState<EditorState>(EMPTY_EDITOR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [roleData, permissionData] = await Promise.all([
        apiRequest<Role[]>("/api/admin/roles", { token }),
        apiRequest<Permission[]>("/api/admin/permissions", { token }),
      ]);
      setRoles(roleData);
      setPermissions(permissionData);
      setEditor((current) => {
        if (!current.id) return current;
        const fresh = roleData.find((role) => role.id === current.id);
        return fresh
          ? {
              id: fresh.id,
              name: fresh.name,
              description: fresh.description ?? "",
              permissionNames: fresh.permissions.map((permission) => permission.name),
            }
          : EMPTY_EDITOR;
      });
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.status === 403) {
        setError("Tài khoản đã đăng nhập nhưng chưa có đủ permissions.read và roles.read.");
      } else {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Fetching remote RBAC state is the synchronization purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of permissions) {
      const [table] = permission.name.split(".");
      const current = groups.get(table) ?? [];
      current.push(permission);
      groups.set(table, current);
    }
    return [...groups.entries()]
      .filter(([table]) => table.includes(search.trim().toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, search]);

  const selectedRole = roles.find((role) => role.id === editor.id) ?? null;
  const isProtected = selectedRole?.name === "super_admin";

  const selectRole = (role: Role) => {
    setNotice(null);
    setError(null);
    setEditor({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      permissionNames: role.permissions.map((permission) => permission.name),
    });
  };

  const togglePermission = (permissionName: string) => {
    setEditor((current) => ({
      ...current,
      permissionNames: current.permissionNames.includes(permissionName)
        ? current.permissionNames.filter((name) => name !== permissionName)
        : [...current.permissionNames, permissionName],
    }));
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const names = groupPermissions.map((permission) => permission.name);
    const allSelected = names.every((name) => editor.permissionNames.includes(name));
    setEditor((current) => ({
      ...current,
      permissionNames: allSelected
        ? current.permissionNames.filter((name) => !names.includes(name))
        : [...new Set([...current.permissionNames, ...names])],
    }));
  };

  const saveRole = async () => {
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      if (!editor.id) {
        const created = await apiRequest<Role>("/api/admin/roles", {
          method: "POST",
          token,
          body: {
            name: editor.name,
            description: editor.description || null,
            permissionNames: editor.permissionNames,
          },
        });
        setNotice(`Đã tạo role ${created.name}`);
        await loadData();
        selectRole(created);
        return;
      }

      const updated = await apiRequest<Role>(`/api/admin/roles/${editor.id}`, {
        method: "PATCH",
        token,
        body: {
          name: editor.name,
          description: editor.description || null,
        },
      });

      let finalRole = updated;
      if (!isProtected) {
        finalRole = await apiRequest<Role>(`/api/admin/roles/${editor.id}/permissions`, {
          method: "PUT",
          token,
          body: { permissionNames: editor.permissionNames },
        });
      }

      setNotice(`Đã cập nhật role ${finalRole.name}`);
      await loadData();
      selectRole(finalRole);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async () => {
    if (!editor.id || isProtected) return;
    if (!window.confirm(`Xóa role “${editor.name}”? Thao tác này không thể hoàn tác.`)) return;

    setDeleting(true);
    setError(null);
    setNotice(null);
    try {
      await apiRequest<void>(`/api/admin/roles/${editor.id}`, {
        method: "DELETE",
        token,
      });
      setNotice(`Đã xóa role ${editor.name}`);
      setEditor(EMPTY_EDITOR);
      await loadData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>{roles.length} role trong hệ thống</CardDescription>
            </div>
            <Button
              size="icon"
              variant="outline"
              aria-label="Tạo role"
              onClick={() => {
                setEditor(EMPTY_EDITOR);
                setError(null);
                setNotice(null);
              }}
            >
              <Plus />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {loading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" /> Đang tải...</div>
          ) : roles.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Chưa có role hoặc tài khoản không có quyền đọc.</p>
          ) : (
            <div className="space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-muted",
                    editor.id === role.id && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  <Shield className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{role.name}</span>
                    <span className={cn("block text-xs text-muted-foreground", editor.id === role.id && "text-primary-foreground/70")}>{role.permissions.length} quyền</span>
                  </span>
                  <ChevronRight className="size-4" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
        {error && <Alert variant="destructive">{error}</Alert>}
        {notice && <Alert variant="success">{notice}</Alert>}

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{editor.id ? `Chỉnh sửa ${editor.name}` : "Tạo role mới"}</CardTitle>
                <CardDescription>Thông tin role và danh sách quyền được backend kiểm tra lại.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
                <RefreshCw className={cn(loading && "animate-spin")} /> Làm mới
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roleName">Tên role</Label>
                <Input
                  id="roleName"
                  value={editor.name}
                  onChange={(event) => setEditor((current) => ({ ...current, name: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))}
                  placeholder="vocabulary_manager"
                  disabled={isProtected}
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="roleDescription">Mô tả</Label>
                <Textarea
                  id="roleDescription"
                  value={editor.description}
                  onChange={(event) => setEditor((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Mô tả trách nhiệm của role..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <div className="text-sm text-muted-foreground">
                Đã chọn <strong className="text-foreground">{editor.permissionNames.length}</strong> / {permissions.length} quyền
                {isProtected && <Badge variant="secondary" className="ml-2">Quyền do seed quản lý</Badge>}
              </div>
              <div className="flex gap-2">
                {editor.id && !isProtected && (
                  <Button variant="destructive" onClick={deleteRole} disabled={deleting || saving}>
                    {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />} Xóa
                  </Button>
                )}
                <Button onClick={saveRole} disabled={saving || !editor.name.trim()}>
                  {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
                  {saving ? "Đang lưu..." : "Lưu role"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Quyền theo định dạng `table.action`.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên bảng..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {permissionGroups.map(([table, groupPermissions]) => {
              const selectedCount = groupPermissions.filter((permission) => editor.permissionNames.includes(permission.name)).length;
              const allSelected = selectedCount === groupPermissions.length;
              return (
                <div key={table} className="rounded-2xl border bg-muted/25 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={isProtected}
                      onClick={() => toggleGroup(groupPermissions)}
                      className="flex items-center gap-2 text-left font-bold disabled:cursor-not-allowed"
                    >
                      <span className={cn("flex size-5 items-center justify-center rounded-md border", allSelected && "border-primary bg-primary text-primary-foreground")}>
                        {allSelected && <Check className="size-3.5" />}
                      </span>
                      {humanize(table)}
                    </button>
                    <Badge variant="outline">{selectedCount}/{groupPermissions.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {groupPermissions.map((permission) => {
                      const checked = editor.permissionNames.includes(permission.name);
                      const action = permission.name.split(".")[1];
                      return (
                        <label
                          key={permission.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/40",
                            checked && "border-primary/40 bg-primary/5",
                            isProtected && "cursor-not-allowed opacity-70",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isProtected}
                            onChange={() => togglePermission(permission.name)}
                            className="mt-0.5 size-4 accent-[var(--primary)]"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{humanize(action)}</span>
                            <span className="block truncate text-xs text-muted-foreground">{permission.name}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
