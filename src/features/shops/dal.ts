import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";

import { getAdminPrincipal } from "@/features/auth/dal";
import { canManageShop, canManageSite } from "@/features/auth/permissions";
import { toUploadedImage, type UploadedImage } from "@/features/images/dto";
import { toFieldErrors, type ActionResult } from "@/lib/action-result";
import { db } from "@/server/db";
import { PG_FOREIGN_KEY_VIOLATION, pgErrorCode } from "@/server/db/errors";
import { images, shopMembers, shops } from "@/server/db/schema";

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
  profileImage: UploadedImage | null;
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
    const [row] = await db
      .select({
        shop: settingsColumns,
        profileImage: {
          id: images.id,
          key: images.key,
          thumbKey: images.thumbKey,
          width: images.width,
          height: images.height,
        },
      })
      .from(shops)
      .leftJoin(
        images,
        and(eq(images.id, shops.profileImageId), eq(images.shopId, shops.id)),
      )
      .where(eq(shops.slug, slug.data))
      .limit(1);
    if (!row || !canManageShop(admin, row.shop.id)) return null;
    return {
      ...row.shop,
      profileImage: row.profileImage && toUploadedImage(row.profileImage),
    };
  },
);

// 상점에 딸린 것(카테고리, 사진, 글)을 쓰는 함수의 입구. 관리할 수 없는 상점이면 던진다.
// 화면에서는 그런 상점의 버튼이 보이지 않으므로, 화면을 거치지 않은 요청일 때만 일어난다.
export async function requireManagedShop(
  slugParam: string,
): Promise<ShopSettings> {
  const shop = await getShopSettings(slugParam);
  if (!shop) throw new Error("상점을 찾을 수 없거나 권한이 없어요.");
  return shop;
}

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
  const shop = await requireManagedShop(slugParam);

  const parsed = shopFieldsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력한 내용을 확인해 주세요.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    await db.update(shops).set(parsed.data).where(eq(shops.id, shop.id));
  } catch (error) {
    // 대표 사진은 이 상점이 올린 사진이어야 한다. 없는 사진이나 다른 상점의 사진은 DB 제약이 막는다.
    if (pgErrorCode(error) !== PG_FOREIGN_KEY_VIOLATION) throw error;
    return {
      ok: false,
      error: "입력한 내용을 확인해 주세요.",
      fieldErrors: {
        profileImageId: "사진을 찾을 수 없어요. 다시 올려 주세요.",
      },
      values,
    };
  }
  return { ok: true, message: "저장했어요." };
}
