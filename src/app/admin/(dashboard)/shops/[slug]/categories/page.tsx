import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CategoryManager } from "@/features/categories/components/category-manager";
import { listCategoryTree } from "@/features/categories/dal";

export const metadata: Metadata = { title: "카테고리" };

async function CategorySection({
  params,
}: Pick<PageProps<"/admin/shops/[slug]/categories">, "params">) {
  const { slug } = await params;
  const categories = await listCategoryTree(slug);
  if (!categories) notFound();

  return <CategoryManager slug={slug} categories={categories} />;
}

export default function ShopCategoriesPage({
  params,
}: PageProps<"/admin/shops/[slug]/categories">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <CategorySection params={params} />
    </Suspense>
  );
}
