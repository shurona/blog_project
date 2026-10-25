import { formatKoreanDate } from "@/lib/date";
import type { PostListEntry } from "./components/post-list";
import type { PostListItem } from "./types";

// 서버에서 받은 글 목록을 목록 화면에 그릴 모양으로 바꾼다.
export function toPostListEntries(
  shopSlug: string,
  posts: PostListItem[],
): PostListEntry[] {
  return posts.map((post) => ({
    id: post.id,
    href: `/${shopSlug}/posts/${post.id}`,
    title: post.title,
    categoryName: post.categoryName,
    dateLabel: formatKoreanDate(post.publishedAt),
    summary: post.summary,
    coverImageKey: post.coverImageKey,
  }));
}
