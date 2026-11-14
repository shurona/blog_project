"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { authClient } from "../auth-client";
import { toAuthErrorMessage } from "../error-messages";
import { PASSWORD_MIN_LENGTH } from "../password-policy";
import { changePasswordSchema } from "../validation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = changePasswordSchema.safeParse({
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword"),
      confirmPassword: form.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await authClient.changePassword({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        // 비밀번호를 바꾸면 다른 기기에 남아 있는 로그인은 끊는다.
        revokeOtherSessions: true,
      });
      if (result.error) {
        setError(toAuthErrorMessage(result.error));
        return;
      }
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        name="currentPassword"
        label="지금 비밀번호"
        autoComplete="current-password"
      />
      <PasswordField
        name="newPassword"
        label={`새 비밀번호 (${PASSWORD_MIN_LENGTH}자 이상)`}
        autoComplete="new-password"
      />
      <PasswordField
        name="confirmPassword"
        label="새 비밀번호 확인"
        autoComplete="new-password"
      />
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
        {pending ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}

function PasswordField({
  name,
  label,
  autoComplete,
}: {
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
      />
    </label>
  );
}
