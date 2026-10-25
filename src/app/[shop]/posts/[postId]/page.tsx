import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostArticle } from "@/features/posts/components/post-article";
import { findPost, findShop } from "@/sample/queries";

async function PostDetailSection({
  params,
}: Pick<PageProps<"/[shop]/posts/[postId]">, "params">) {
  const { shop: shopParam, postId } = await params;
  const shop = await findShop(shopParam);
  if (!shop) notFound();
  const post = await findPost(shop.slug, postId);
  if (!post) notFound();

  return <PostArticle shopSlug={shop.slug} post={post} />;
}

export default function PostPage({
  params,
}: PageProps<"/[shop]/posts/[postId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <PostDetailSection params={params} />
    </Suspense>
  );
}
