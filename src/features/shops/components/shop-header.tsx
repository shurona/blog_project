import Link from "next/link";
import { SHOP_TYPE_LABELS } from "../shop-types";
import type { ShopProfile } from "../types";

export function ShopHeader({ shop }: { shop: ShopProfile }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-gray-500">
          {SHOP_TYPE_LABELS[shop.type]} 블로그
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          <Link href={`/${shop.slug}`}>{shop.name}</Link>
        </h1>
      </div>
    </header>
  );
}
