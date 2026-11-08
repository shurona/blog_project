import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 링크 주소를 타입 검사한다. 변수로 만든 주소는 `as Route`가 필요할 수 있다.
  typedRoutes: true,
  images: {
    // 사진은 올리기 전에 브라우저에서 줄이므로 Vercel 이미지 최적화(월 5,000회 한도)를 쓰지 않는다.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
