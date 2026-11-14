import type { Metadata } from "next";

// 관리자 페이지는 검색 결과에 나오지 않게 한다.
export const metadata: Metadata = {
  title: { default: "관리자", template: "%s · 관리자" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
