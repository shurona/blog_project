import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ShopTabs } from "@/features/shops/components/shop-tabs";
import { getShopSettings } from "@/features/shops/dal";
import { SHOP_TYPE_LABELS } from "@/features/shops/shop-types";

type ShopParams = Pick<LayoutProps<"/admin/shops/[slug]">, "params">;

// 상점 이름과 탭. 관리할 수 없는 상점이면 404를 보여준다.
async function ShopHeader({ params }: ShopParams) {
  const shop = await getShopSettings((await params).slug);
  if (!shop) notFound();

  return (
    <>
      <p className="text-sm text-gray-500">{SHOP_TYPE_LABELS[shop.type]}</p>
      <h1 className="mt-1 text-2xl font-bold">{shop.name}</h1>
      <div className="mt-6">
        <ShopTabs slug={shop.slug} />
      </div>
    </>
  );
}

export default function ShopAdminLayout({
  children,
  params,
}: LayoutProps<"/admin/shops/[slug]">) {
  return (
    <section>
      <Link
        href="/admin/shops"
        className="text-sm text-gray-600 hover:underline"
      >
        ← 상점 목록
      </Link>
      <div className="mt-2 mb-6">
        <Suspense fallback={<div className="h-24" />}>
          <ShopHeader params={params} />
        </Suspense>
      </div>
      {children}
    </section>
  );
}
