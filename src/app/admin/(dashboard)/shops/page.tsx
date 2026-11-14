import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getAdminPrincipal } from "@/features/auth/dal";
import { canManageSite } from "@/features/auth/permissions";
import { listManagedShops } from "@/features/shops/dal";
import { SHOP_TYPE_LABELS } from "@/features/shops/shop-types";

export const metadata: Metadata = { title: "상점" };

async function ShopList() {
  const [admin, shops] = await Promise.all([
    getAdminPrincipal(),
    listManagedShops(),
  ]);
  const isSiteManager = canManageSite(admin);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상점</h1>
        {isSiteManager && (
          <Link
            href="/admin/shops/new"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            상점 만들기
          </Link>
        )}
      </div>

      {shops.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white px-5 py-12 text-center text-sm text-gray-500">
          {isSiteManager
            ? "아직 상점이 없어요. 상점을 만들어 주세요."
            : "맡은 상점이 없어요. 전체 관리자에게 문의해 주세요."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {shops.map((shop) => (
            <li key={shop.id}>
              <Link
                href={`/admin/shops/${shop.slug}` as Route}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <span>
                  <span className="font-medium">{shop.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    /{shop.slug}
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  {SHOP_TYPE_LABELS[shop.type]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <ShopList />
    </Suspense>
  );
}
