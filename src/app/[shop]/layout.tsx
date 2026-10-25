import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopHeader } from "@/features/shops/components/shop-header";
import { ShopSidebar } from "@/features/shops/components/shop-sidebar";
import { findShop, listCategories } from "@/sample/queries";

type ShopParams = Pick<LayoutProps<"/[shop]">, "params">;

async function ShopHeaderSection({ params }: ShopParams) {
  const shop = await findShop((await params).shop);
  if (!shop) notFound();

  return <ShopHeader shop={shop} />;
}

async function ShopSidebarSection({ params }: ShopParams) {
  const shop = await findShop((await params).shop);
  if (!shop) notFound();
  const categories = await listCategories(shop.slug);

  return <ShopSidebar shop={shop} categories={categories} />;
}

// params는 Suspense 안에서 읽는다. 레이아웃에서 바로 읽으면 이 레이아웃을 미리 만들어 둘 수 없다(Cache Components).
// 휴대폰에서는 사이드바가 본문 아래로 내려간다.
export default function ShopLayout({
  children,
  params,
}: LayoutProps<"/[shop]">) {
  return (
    <>
      <Suspense
        fallback={<div className="h-28 border-b border-gray-200 bg-white" />}
      >
        <ShopHeaderSection params={params} />
      </Suspense>
      <div className="mx-auto flex max-w-5xl flex-col-reverse gap-6 px-4 py-8 md:flex-row">
        <div className="md:w-64 md:shrink-0">
          <Suspense fallback={null}>
            <ShopSidebarSection params={params} />
          </Suspense>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
