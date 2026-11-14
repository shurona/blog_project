"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "../auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          router.replace("/admin/login");
          router.refresh();
        })
      }
      className="text-sm text-gray-600 hover:underline disabled:opacity-50"
    >
      {pending ? "로그아웃하는 중…" : "로그아웃"}
    </button>
  );
}
