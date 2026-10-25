import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상점 블로그",
  description: "콘도·펜션·골프 상점 블로그",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
