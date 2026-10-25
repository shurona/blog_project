import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostList } from "@/features/posts/components/post-list";
import { toPostListEntries } from "@/features/posts/list-entries";
import { findCategory, findShop, listPosts } from "@/sample/queries";

async function CategoryPosts({
  params,
}: Pick<PageProps<"/[shop]/categories/[categoryId]">, "params">) {
  const { shop: shopParam, categoryId } = await params;
  const shop = await findShop(shopParam);
  if (!shop) notFound();
  const category = await findCategory(shop.slug, categoryId);
  if (!category) notFound();
  const posts = await listPosts(shop.slug, category.id);

  return (
    <PostList
      heading={category.name}
      posts={toPostListEntries(shop.slug, posts)}
    />
  );
}

export default function CategoryPage({
  params,
}: PageProps<"/[shop]/categories/[categoryId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <CategoryPosts params={params} />
    </Suspense>
  );
}
