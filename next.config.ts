import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 실행에 필요한 파일만 .next/standalone에 모은다. Dockerfile이 이 폴더로 이미지를 만든다.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // 링크 주소를 타입 검사한다. 변수로 만든 주소는 `as Route`가 필요할 수 있다.
  typedRoutes: true,
  images: {
    // 사진은 올리기 전에 브라우저에서 줄이고 R2에서 바로 불러오므로, 서버의 이미지 최적화를 쓰지 않는다.
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
