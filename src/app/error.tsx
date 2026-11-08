"use client";

import Link from "next/link";
import { useEffect } from "react";

// 예상하지 못한 오류가 났을 때 보여주는 화면. 서버에서 난 오류는 자세한 내용 없이 식별값만 넘어온다.
export default function RootError({
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
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-xl font-bold">문제가 생겼어요</h1>
      <p className="mt-2 text-sm text-gray-600">잠시 후 다시 시도해 주세요.</p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
        >
          다시 시도
        </button>
        <Link href="/" className="px-4 py-2 text-sky-700 hover:underline">
          처음으로
        </Link>
      </div>
    </main>
  );
}
