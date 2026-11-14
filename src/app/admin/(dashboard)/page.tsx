import type { Metadata } from "next";
import { Suspense } from "react";

import { requireAdmin } from "@/features/auth/dal";

export const metadata: Metadata = { title: "대시보드" };

async function Greeting() {
  const admin = await requireAdmin();
  return <h1 className="text-2xl font-bold">안녕하세요, {admin.name}님</h1>;
}

export default function DashboardPage() {
  return (
    <section>
      <Suspense fallback={<div className="h-8" />}>
        <Greeting />
      </Suspense>
      <p className="mt-3 text-sm text-gray-600">
        상점, 카테고리, 글 관리는 하나씩 만들어 갈 거예요.
      </p>
    </section>
  );
}
