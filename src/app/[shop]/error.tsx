"use client";

import { useEffect } from "react";

// 상점 페이지에서 오류가 나도 상점 제목과 사이드바는 그대로 두고, 본문 자리에만 보여준다.
export default function ShopError({
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
    <section className="rounded-lg border border-gray-200 bg-white px-5 py-12 text-center">
      <h2 className="font-bold">글을 불러오지 못했어요</h2>
      <p className="mt-2 text-sm text-gray-600">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
      >
        다시 시도
      </button>
    </section>
  );
}
