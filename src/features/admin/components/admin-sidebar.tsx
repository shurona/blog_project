import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import type { CurrentAdmin } from "@/features/auth/dal";

import { AdminNav } from "./admin-nav";

export function AdminSidebar({ admin }: { admin: CurrentAdmin }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div>
        <Link href="/admin" className="text-lg font-bold">
          상점 블로그 관리
        </Link>
        <p className="mt-1 text-xs text-gray-500">
          {admin.name} ({admin.username})
          {admin.isSuperAdmin && " · 전체 관리자"}
        </p>
      </div>
      <AdminNav isSuperAdmin={admin.isSuperAdmin} />
      <div className="mt-auto space-y-2 border-t border-gray-200 pt-4">
        <Link
          href="/admin/change-password"
          className="block text-sm text-gray-600 hover:underline"
        >
          비밀번호 변경
        </Link>
        <Link href="/" className="block text-sm text-gray-600 hover:underline">
          사이트 보기
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
