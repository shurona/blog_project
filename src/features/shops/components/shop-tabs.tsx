"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 상점 안의 메뉴. 주소가 없는 탭은 아직 만들지 않은 기능이라 "준비 중"으로 보여준다.
export function ShopTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/admin/shops/${slug}`;
  const tabs: { label: string; href?: Route }[] = [
    { label: "상점 정보", href: base as Route },
    { label: "카테고리", href: `${base}/categories` as Route },
    { label: "글" },
    { label: "휴지통" },
  ];

  return (
    <nav aria-label="상점 메뉴" className="border-b border-gray-200">
      <ul className="-mb-px flex gap-1 text-sm">
        {tabs.map((tab) => (
          <li key={tab.label}>
            {tab.href ? (
              <Link
                href={tab.href}
                aria-current={pathname === tab.href ? "page" : undefined}
                className={`block border-b-2 px-4 py-2 ${pathname === tab.href ? "border-gray-900 font-medium text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"}`}
              >
                {tab.label}
              </Link>
            ) : (
              <span className="block border-b-2 border-transparent px-4 py-2 text-gray-400">
                {tab.label}
                <span className="ml-1 text-xs">준비 중</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
