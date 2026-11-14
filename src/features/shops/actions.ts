"use server";

import type { Route } from "next";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { formValues, type ActionResult } from "@/lib/action-result";

import { SHOPS_TAG, shopTag } from "./cache-tags";
import { createShop, updateShop } from "./dal";

// 서버 액션은 DAL을 부르고 화면 갱신만 한다. 권한 확인과 입력 검사는 DAL에서 한다.

export async function createShopAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await createShop(formValues(formData));
  if (!result.ok) return result;
  updateTag(SHOPS_TAG);
  redirect(`/admin/shops/${result.slug}` as Route);
}

export async function updateShopAction(
  slug: string,
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await updateShop(slug, formValues(formData));
  if (result.ok) {
    updateTag(SHOPS_TAG);
    updateTag(shopTag(slug));
  }
  return result;
}
