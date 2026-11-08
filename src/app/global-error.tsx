"use client";

import { useEffect } from "react";

// 최상위 레이아웃에서 오류가 났을 때만 쓰는 화면. 자기 <html>을 그리고 전역 CSS가 적용되지 않아서 스타일을 직접 적는다.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: "96px 16px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 20 }}>문제가 생겼어요</h1>
        <p style={{ color: "#4b5563" }}>잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{ marginTop: 16, padding: "8px 16px" }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
