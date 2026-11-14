import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { requireAdmin } from "@/features/auth/dal";

export const metadata: Metadata = { title: "비밀번호 변경" };

async function ChangePasswordSection() {
  const admin = await requireAdmin({ allowPendingPasswordChange: true });

  return (
    <>
      {admin.mustChangePassword ? (
        <p className="mb-6 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          임시 비밀번호로 로그인했어요. 새 비밀번호로 바꿔야 관리 화면을 쓸 수
          있어요.
        </p>
      ) : (
        <Link
          href="/admin"
          className="mb-6 block text-sm text-gray-600 hover:underline"
        >
          ← 관리 화면으로
        </Link>
      )}
      <ChangePasswordForm />
    </>
  );
}

export default function ChangePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8">
        <h1 className="mb-6 text-xl font-bold">비밀번호 변경</h1>
        <Suspense
          fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}
        >
          <ChangePasswordSection />
        </Suspense>
      </div>
    </main>
  );
}
