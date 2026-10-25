import Link from "next/link";
import { formatKoreanDate } from "@/lib/date";
import type { PostDetail } from "../types";
import { PostBody } from "./post-body";

export function PostArticle({
  shopSlug,
  post,
}: {
  shopSlug: string;
  post: PostDetail;
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white px-6 py-8 md:px-10">
      <header className="border-b border-gray-200 pb-6">
        <Link
          href={`/${shopSlug}/categories/${post.categoryId}`}
          className="text-sm text-sky-700 hover:underline"
        >
          {post.categoryName}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{post.title}</h1>
        <p className="mt-3 text-sm text-gray-500">
          {formatKoreanDate(post.publishedAt)}
        </p>
      </header>
      <PostBody content={post.content} />
      <footer className="mt-10 border-t border-gray-200 pt-6">
        <Link
          href={`/${shopSlug}`}
          className="text-sm text-gray-600 hover:underline"
        >
          ← 목록으로
        </Link>
      </footer>
    </article>
  );
}
