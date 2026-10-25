export const POST_STATUSES = ["draft", "published", "private"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "임시저장",
  published: "공개",
  private: "비공개",
};
