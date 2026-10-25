import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostList } from "@/features/posts/components/post-list";
import { toPostListEntries } from "@/features/posts/list-entries";
import { findShop, listPosts } from "@/sample/queries";

async function AllPosts({ params }: Pick<PageProps<"/[shop]">, "params">) {
  const shop = await findShop((await params).shop);
  if (!shop) notFound();
  const posts = await listPosts(shop.slug);

  return (
    <PostList heading="전체보기" posts={toPostListEntries(shop.slug, posts)} />
  );
}

export default function ShopHomePage({ params }: PageProps<"/[shop]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <AllPosts params={params} />
    </Suspense>
  );
}
