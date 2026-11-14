import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAdminPrincipal } from "@/features/auth/dal";
import { canManageSite } from "@/features/auth/permissions";
import { createShopAction } from "@/features/shops/actions";
import { ShopForm } from "@/features/shops/components/shop-form";

export const metadata: Metadata = { title: "상점 만들기" };

// 상점 만들기는 전체 관리자만 할 수 있다. 다른 관리자에게는 404를 보여준다.
async function NewShopForm() {
  if (!canManageSite(await getAdminPrincipal())) notFound();
  return <ShopForm action={createShopAction} />;
}

export default function NewShopPage() {
  return (
    <section>
      <Link
        href="/admin/shops"
        className="text-sm text-gray-600 hover:underline"
      >
        ← 상점 목록
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">상점 만들기</h1>
      <Suspense
        fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}
      >
        <NewShopForm />
      </Suspense>
    </section>
  );
}
