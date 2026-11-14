"use client";

import { useEffect } from "react";

// 관리자 페이지에서 예상하지 못한 오류가 났을 때 보여준다.
export default function AdminError({
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
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-xl font-bold">문제가 생겼어요</h1>
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
