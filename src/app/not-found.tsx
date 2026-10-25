import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-sky-700 hover:underline"
      >
        처음으로
      </Link>
    </main>
  );
}
