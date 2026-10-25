"use client";

import Link from "next/link";
import { useState } from "react";
import { PostImage } from "./post-image";

// 목록 한 줄에 그릴 내용. 날짜는 서버에서 한국 날짜로 바꿔서 넘긴다.
export type PostListEntry = {
  id: number;
  href: string;
  title: string;
  categoryName: string;
  dateLabel: string;
  summary: string;
  coverImageKey: string | null;
};

type View = "list" | "album";

export function PostList({
  heading,
  posts,
}: {
  heading: string;
  posts: PostListEntry[];
}) {
  const [view, setView] = useState<View>("list");

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-bold">
          {heading}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {posts.length}개의 글
          </span>
        </h2>
        <div
          role="group"
          aria-label="목록 보기 방식"
          className="flex overflow-hidden rounded border border-gray-300 text-sm"
        >
          <ViewButton
            label="목록형"
            active={view === "list"}
            onClick={() => setView("list")}
          />
          <ViewButton
            label="앨범형"
            active={view === "album"}
            onClick={() => setView("album")}
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">
          아직 글이 없어요.
        </p>
      ) : view === "list" ? (
        <ListView posts={posts} />
      ) : (
        <AlbumView posts={posts} />
      )}
    </section>
  );
}

function ViewButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-1 ${active ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );
}

function ListView({ posts }: { posts: PostListEntry[] }) {
  return (
    <ul className="divide-y divide-gray-100">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={post.href}
            className="flex gap-4 px-5 py-4 hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">
                {post.categoryName} · {post.dateLabel}
              </p>
              <h3 className="mt-1 truncate font-semibold text-gray-900">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {post.summary}
              </p>
            </div>
            {post.coverImageKey && (
              <PostImage
                imageKey={post.coverImageKey}
                alt={`${post.title} 대표 사진`}
                className="size-24 shrink-0 rounded"
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AlbumView({ posts }: { posts: PostListEntry[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={post.href} className="group block">
            {post.coverImageKey ? (
              <PostImage
                imageKey={post.coverImageKey}
                alt={`${post.title} 대표 사진`}
                className="aspect-square w-full rounded"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                사진 없음
              </div>
            )}
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:underline">
              {post.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{post.dateLabel}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
