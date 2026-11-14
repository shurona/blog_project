import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { shopMembers } from "@/server/db/schema";

import type { AdminPrincipal } from "./permissions";

// 화면에 넘기는 로그인한 관리자 정보
export type CurrentAdmin = {
  id: string;
  username: string;
  name: string;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
};

// 로그인한 관리자. 쿠키를 읽으므로 <Suspense> 안에서 부르고, 한 요청 안에서는 한 번만 조회한다.
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  return {
    id: user.id,
    username: user.username ?? "",
    name: user.name,
    isSuperAdmin: user.isSuperAdmin,
    mustChangePassword: user.mustChangePassword,
  };
});

// 관리자 페이지와 관리자 기능의 입구. 로그인하지 않았으면 로그인 화면으로,
// 임시 비밀번호를 아직 바꾸지 않았으면 비밀번호 변경 화면으로 보낸다.
export async function requireAdmin({
  allowPendingPasswordChange = false,
} = {}): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.mustChangePassword && !allowPendingPasswordChange) {
    redirect("/admin/change-password");
  }
  return admin;
}

// 권한 판단에 쓰는 관리자 정보. 맡은 상점 번호를 함께 담는다. 한 요청 안에서는 한 번만 조회한다.
export const getAdminPrincipal = cache(
  async (): Promise<CurrentAdmin & AdminPrincipal> => {
    const admin = await requireAdmin();
    // 전체 관리자는 모든 상점을 관리하므로 맡은 상점을 따로 조회하지 않는다.
    if (admin.isSuperAdmin) return { ...admin, shopIds: [] };
    const rows = await db
      .select({ shopId: shopMembers.shopId })
      .from(shopMembers)
      .where(eq(shopMembers.userId, admin.id));
    return { ...admin, shopIds: rows.map((row) => row.shopId) };
  },
);
