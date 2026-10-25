import Link from "next/link";
import { redirect } from "next/navigation";
import { SHOP_TYPE_LABELS } from "@/features/shops/shop-types";
import { listShops } from "@/sample/queries";

// 상점이 하나면 그 상점으로 바로 이동하고, 여러 개면 상점 목록을 보여준다.
export default async function HomePage() {
  const shops = await listShops();
  if (shops.length === 1) redirect(`/${shops[0].slug}`);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">상점 목록</h1>
      <ul className="mt-6 space-y-3">
        {shops.map((shop) => (
          <li key={shop.slug}>
            <Link
              href={`/${shop.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 hover:bg-gray-50"
            >
              <p className="text-xs text-gray-500">
                {SHOP_TYPE_LABELS[shop.type]}
              </p>
              <p className="mt-1 font-bold">{shop.name}</p>
              <p className="mt-1 text-sm text-gray-600">{shop.intro}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
