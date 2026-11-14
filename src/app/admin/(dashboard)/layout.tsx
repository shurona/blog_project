import { Suspense } from "react";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireAdmin } from "@/features/auth/dal";

// 로그인하지 않았으면 로그인 화면으로 보낸다. 쿠키를 읽으므로 <Suspense> 안에서 확인한다.
async function SidebarSection() {
  const admin = await requireAdmin();
  return <AdminSidebar admin={admin} />;
}

// 왼쪽 메뉴가 있는 관리 화면. 휴대폰에서는 메뉴가 위로 올라간다.
export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-gray-200 bg-white md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <Suspense fallback={<div className="h-full p-4" />}>
          <SidebarSection />
        </Suspense>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
