import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateShopAction } from "@/features/shops/actions";
import { ShopForm } from "@/features/shops/components/shop-form";
import { getShopSettings } from "@/features/shops/dal";

export const metadata: Metadata = { title: "상점 정보" };

async function ShopSettingsForm({
  params,
}: Pick<PageProps<"/admin/shops/[slug]">, "params">) {
  const shop = await getShopSettings((await params).slug);
  if (!shop) notFound();

  return (
    <ShopForm action={updateShopAction.bind(null, shop.slug)} shop={shop} />
  );
}

export default function ShopSettingsPage({
  params,
}: PageProps<"/admin/shops/[slug]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <ShopSettingsForm params={params} />
    </Suspense>
  );
}
