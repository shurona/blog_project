"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  // 주소가 없으면 아직 만들지 않은 메뉴라 "준비 중"으로 보여준다.
  href?: Route;
  superAdminOnly?: boolean;
};

// 글·카테고리·휴지통은 상점마다 따로 관리해서, 상점 화면 안의 탭에 둔다.
const MENU: MenuItem[] = [
  { label: "대시보드", href: "/admin" },
  { label: "상점", href: "/admin/shops" },
  { label: "관리자 계정", superAdminOnly: true },
];

// 대시보드는 주소가 같을 때만, 나머지는 그 아래 주소에서도 선택된 것으로 본다.
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="관리 메뉴">
      <ul className="space-y-1 text-sm">
        {MENU.filter((item) => isSuperAdmin || !item.superAdminOnly).map(
          (item) => {
            const active = item.href ? isActive(pathname, item.href) : false;
            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded px-3 py-2 ${active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex items-center justify-between px-3 py-2 text-gray-400">
                    {item.label}
                    <span className="text-xs">준비 중</span>
                  </span>
                )}
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}
