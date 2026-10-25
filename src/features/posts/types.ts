import type { JSONContent } from "@tiptap/core";

// 화면에 넘기는 글 정보. DB를 붙인 뒤에도 DAL이 같은 모양으로 돌려준다.
export type PostListItem = {
  id: number;
  title: string;
  categoryId: number;
  categoryName: string;
  publishedAt: string; // ISO 8601, UTC
  summary: string;
  coverImageKey: string | null;
};

export type PostDetail = PostListItem & {
  content: JSONContent;
};
