import Link from "next/link";
import { PostImage } from "@/features/posts/components/post-image";
import type { CategoryWithCount, ShopProfile } from "../types";

export function ShopSidebar({
  shop,
  categories,
}: {
  shop: ShopProfile;
  categories: CategoryWithCount[];
}) {
  // 글마다 카테고리가 꼭 하나라서, 카테고리별 글 수를 더하면 전체 글 수가 된다.
  const totalCount = categories.reduce((sum, c) => sum + c.postCount, 0);

  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        {shop.profileImageKey ? (
          <PostImage
            imageKey={shop.profileImageKey}
            alt={`${shop.name} 대표 사진`}
            className="aspect-square w-full rounded"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
            상점 대표 사진
          </div>
        )}
        <h2 className="mt-4 font-bold">{shop.name}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{shop.intro}</p>
      </section>

      <nav
        aria-label="카테고리"
        className="rounded-lg border border-gray-200 bg-white p-5"
      >
        <h2 className="text-sm font-bold">카테고리</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href={`/${shop.slug}`} className="hover:underline">
              전체보기 <span className="text-gray-400">({totalCount})</span>
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="pl-3">
              <Link
                href={`/${shop.slug}/categories/${category.id}`}
                className="text-gray-700 hover:underline"
              >
                {category.name}{" "}
                <span className="text-gray-400">({category.postCount})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
