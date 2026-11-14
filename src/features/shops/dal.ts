import "server-only";

import { asc, eq } from "drizzle-orm";
import { cache } from "react";

import { getAdminPrincipal } from "@/features/auth/dal";
import { canManageShop, canManageSite } from "@/features/auth/permissions";
import { toFieldErrors, type ActionResult } from "@/lib/action-result";
import { db } from "@/server/db";
import { shopMembers, shops } from "@/server/db/schema";

import type { ShopType } from "./shop-types";
import {
  shopCreateSchema,
  shopFieldsSchema,
  shopSlugSchema,
} from "./validation";

// 관리 화면의 상점 목록 한 줄
export type ManagedShop = {
  id: number;
  slug: string;
  name: string;
  type: ShopType;
};

// 관리 화면의 상점 정보 수정 폼에 채우는 값
export type ShopSettings = ManagedShop & {
  intro: string | null;
  description: string | null;
  address: string | null;
  businessHours: string | null;
  phone: string | null;
  kakaoChannelUrl: string | null;
  instagramUrl: string | null;
  naverMapUrl: string | null;
  kakaoMapUrl: string | null;
};

const summaryColumns = {
  id: shops.id,
  slug: shops.slug,
  name: shops.name,
  type: shops.type,
};

const settingsColumns = {
  ...summaryColumns,
  intro: shops.intro,
  description: shops.description,
  address: shops.address,
  businessHours: shops.businessHours,
  phone: shops.phone,
  kakaoChannelUrl: shops.kakaoChannelUrl,
  instagramUrl: shops.instagramUrl,
  naverMapUrl: shops.naverMapUrl,
  kakaoMapUrl: shops.kakaoMapUrl,
};

// 관리할 수 있는 상점 목록. 전체 관리자는 모든 상점, 상점 관리자는 맡은 상점만 보인다.
export async function listManagedShops(): Promise<ManagedShop[]> {
  const admin = await getAdminPrincipal();
  if (admin.isSuperAdmin) {
    return db.select(summaryColumns).from(shops).orderBy(asc(shops.name));
  }
  return db
    .select(summaryColumns)
    .from(shops)
    .innerJoin(shopMembers, eq(shopMembers.shopId, shops.id))
    .where(eq(shopMembers.userId, admin.id))
    .orderBy(asc(shops.name));
}

// 관리할 수 있는 상점만 돌려준다. 상점이 없거나 권한이 없으면 null(화면에서는 404)이라
// 권한 없는 사람에게는 상점이 있는지도 알려주지 않는다. 한 요청 안에서는 한 번만 조회한다.
export const getShopSettings = cache(
  async (slugParam: string): Promise<ShopSettings | null> => {
    const slug = shopSlugSchema.safeParse(slugParam);
    if (!slug.success) return null;
    const admin = await getAdminPrincipal();
    const [shop] = await db
      .select(settingsColumns)
      .from(shops)
      .where(eq(shops.slug, slug.data))
      .limit(1);
    if (!shop || !canManageShop(admin, shop.id)) return null;
    return shop;
  },
);

// 상점 만들기. 전체 관리자만 할 수 있다.
export async function createShop(
  values: Record<string, string>,
): Promise<ActionResult & { slug?: string }> {
  const admin = await getAdminPrincipal();
  if (!canManageSite(admin)) throw new Error("상점을 만들 권한이 없어요.");

  const parsed = shopCreateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력한 내용을 확인해 주세요.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  const [created] = await db
    .insert(shops)
    .values(parsed.data)
    .onConflictDoNothing({ target: shops.slug })
    .returning({ slug: shops.slug });
  if (!created) {
    return {
      ok: false,
      error: "입력한 내용을 확인해 주세요.",
      fieldErrors: { slug: "이미 쓰고 있는 상점 주소예요." },
      values,
    };
  }
  return { ok: true, slug: created.slug };
}

// 상점 정보 수정. 상점 주소(slug)는 바꾸지 않는다.
export async function updateShop(
  slugParam: string,
  values: Record<string, string>,
): Promise<ActionResult> {
  const shop = await getShopSettings(slugParam);
  if (!shop) throw new Error("상점을 찾을 수 없거나 권한이 없어요.");

  const parsed = shopFieldsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력한 내용을 확인해 주세요.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  await db.update(shops).set(parsed.data).where(eq(shops.id, shop.id));
  return { ok: true, message: "저장했어요." };
}
