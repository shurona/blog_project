"use server";

import { refresh, updateTag } from "next/cache";

import { shopTag } from "@/features/shops/cache-tags";
import { formValues, type ActionResult } from "@/lib/action-result";

import {
  createCategory,
  deleteCategory,
  moveCategory,
  renameCategory,
} from "./dal";
import type { MoveDirection } from "./validation";

// 서버 액션은 DAL을 부르고 화면 갱신만 한다. 권한 확인과 입력 검사는 DAL에서 한다.

// 카테고리는 방문자 화면의 사이드바에도 나오므로 상점 캐시를 갱신하고,
// 관리 화면의 목록도 다시 그린다.
function afterWrite(slug: string, result: ActionResult): ActionResult {
  if (result.ok) {
    updateTag(shopTag(slug));
    refresh();
  }
  return result;
}

export async function createCategoryAction(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  return afterWrite(slug, await createCategory(slug, formValues(formData)));
}

export async function renameCategoryAction(
  slug: string,
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  return afterWrite(slug, await renameCategory(slug, id, formValues(formData)));
}

export async function moveCategoryAction(
  slug: string,
  id: number,
  direction: MoveDirection,
): Promise<ActionResult> {
  return afterWrite(slug, await moveCategory(slug, id, direction));
}

export async function deleteCategoryAction(
  slug: string,
  id: number,
): Promise<ActionResult> {
  return afterWrite(slug, await deleteCategory(slug, id));
}
