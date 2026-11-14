import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentAdmin } from "@/features/auth/dal";

export const metadata: Metadata = { title: "로그인" };

// 이미 로그인했으면 관리 화면으로 보낸다. 쿠키를 읽으므로 <Suspense> 안에 둔다.
async function LoginGate() {
  if (await getCurrentAdmin()) redirect("/admin");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8">
        <h1 className="mb-6 text-xl font-bold">관리자 로그인</h1>
        <Suspense fallback={<LoginForm />}>
          <LoginGate />
        </Suspense>
      </div>
    </main>
  );
}
