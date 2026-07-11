import { AppHeader } from "@/components/app-header";
import { RoleManager } from "@/components/admin/role-manager";
import { ProtectedPage } from "@/components/protected-page";

export default function AdminPage() {
  return (
    <ProtectedPage>
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">RBAC Administration</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Roles & Permissions</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Quản lý role và gán quyền CRUD cho các bảng trong hệ thống. Backend vẫn là nơi quyết định quyền truy cập cuối cùng.</p>
          </div>
          <RoleManager />
        </main>
      </div>
    </ProtectedPage>
  );
}
