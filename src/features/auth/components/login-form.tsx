"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { authClient } from "../auth-client";
import { toAuthErrorMessage } from "../error-messages";
import { loginSchema } from "../validation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      username: form.get("username"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await authClient.signIn.username(parsed.data);
      if (result.error) {
        setError(toAuthErrorMessage(result.error));
        return;
      }
      // 임시 비밀번호 계정이면 관리 화면이 비밀번호 변경 화면으로 보낸다.
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="font-medium text-gray-700">아이디</span>
        <input
          name="username"
          autoComplete="username"
          required
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-gray-700">비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "로그인하는 중…" : "로그인"}
      </button>
    </form>
  );
}
