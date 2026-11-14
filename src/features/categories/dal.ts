import "server-only";

import { and, asc, eq, isNull, sql, type SQL } from "drizzle-orm";

import { getShopSettings } from "@/features/shops/dal";
import { toFieldErrors, type ActionResult } from "@/lib/action-result";
import { db } from "@/server/db";
import {
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
  pgErrorCode,
} from "@/server/db/errors";
import { categories, posts } from "@/server/db/schema";

import { buildCategoryTree, moveInOrder, type CategoryNode } from "./tree";
import {
  categoryCreateSchema,
  categoryIdSchema,
  categoryRenameSchema,
  moveDirectionSchema,
} from "./validation";

const INVALID_INPUT = "입력한 내용을 확인해 주세요.";
const DUPLICATE_NAME = "같은 이름의 카테고리가 이미 있어요.";
// 다른 관리자가 먼저 지웠을 때처럼, 화면에 보이던 카테고리가 이미 없을 수 있다.
const NOT_FOUND: ActionResult = {
  ok: false,
  error: "카테고리를 찾을 수 없어요. 화면을 새로 고쳐 주세요.",
};

// 쓰기 함수의 입구. 관리할 수 없는 상점이면 던진다(화면에서는 생길 수 없는 요청이다).
async function requireManagedShop(slugParam: string) {
  const shop = await getShopSettings(slugParam);
  if (!shop) throw new Error("상점을 찾을 수 없거나 권한이 없어요.");
  return shop;
}

// 카테고리 조회·수정 조건은 모두 이 함수를 거쳐서, 상점 조건을 빠뜨릴 수 없게 한다.
function inShop(shopId: number, ...conditions: SQL[]) {
  return and(eq(categories.shopId, shopId), ...conditions);
}

function sameParent(parentId: number | null) {
  return parentId === null
    ? isNull(categories.parentId)
    : eq(categories.parentId, parentId);
}

function parseCategoryId(id: unknown): number {
  const parsed = categoryIdSchema.safeParse(id);
  if (!parsed.success) throw new Error("카테고리 번호가 올바르지 않아요.");
  return parsed.data;
}

// 관리 화면의 카테고리 목록. 관리할 수 없는 상점이면 null(화면에서는 404)이다.
export async function listCategoryTree(
  slugParam: string,
): Promise<CategoryNode[] | null> {
  const shop = await getShopSettings(slugParam);
  if (!shop) return null;

  const rows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      name: categories.name,
      postCount: sql<number>`count(${posts.id}) filter (where ${posts.deletedAt} is null)`,
      trashedPostCount: sql<number>`count(${posts.id}) filter (where ${posts.deletedAt} is not null)`,
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .where(inShop(shop.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  return buildCategoryTree(
    // count는 bigint라 글자로 온다.
    rows.map((row) => ({
      ...row,
      postCount: Number(row.postCount),
      trashedPostCount: Number(row.trashedPostCount),
    })),
  );
}

// 카테고리 만들기. parentId가 있으면 그 아래에 하위 카테고리를 만든다.
export async function createCategory(
  slugParam: string,
  values: Record<string, string>,
): Promise<ActionResult> {
  const shop = await requireManagedShop(slugParam);

  const parsed = categoryCreateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: INVALID_INPUT,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }
  const { name, parentId = null } = parsed.data;
  const nameError = (message: string): ActionResult => ({
    ok: false,
    error: INVALID_INPUT,
    fieldErrors: { name: message },
    values,
  });

  return db.transaction(async (tx) => {
    if (parentId !== null) {
      // 확인하는 사이에 상위 카테고리가 바뀌지 않게 잠근다.
      const [parent] = await tx
        .select({ parentId: categories.parentId })
        .from(categories)
        .where(inShop(shop.id, eq(categories.id, parentId)))
        .for("update");
      if (!parent) return NOT_FOUND;
      if (parent.parentId !== null) {
        return nameError("카테고리는 2단계까지만 만들 수 있어요.");
      }
      // 하위 카테고리가 있는 상위 카테고리에는 글을 바로 넣지 않는다는 규칙을 지킨다.
      const [post] = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.shopId, shop.id), eq(posts.categoryId, parentId)))
        .limit(1);
      if (post) {
        return nameError(
          "이 카테고리에 글이 있어요(휴지통의 글 포함). 글을 다른 카테고리로 옮긴 뒤 하위 카테고리를 만들어 주세요.",
        );
      }
    }

    // 새 카테고리는 같은 단계의 맨 아래에 둔다.
    const [last] = await tx
      .select({
        sortOrder: sql<number>`coalesce(max(${categories.sortOrder}), -1)`,
      })
      .from(categories)
      .where(inShop(shop.id, sameParent(parentId)));

    const [created] = await tx
      .insert(categories)
      .values({
        shopId: shop.id,
        parentId,
        name,
        sortOrder: Number(last.sortOrder) + 1,
      })
      .onConflictDoNothing()
      .returning({ id: categories.id });
    if (!created) return nameError(DUPLICATE_NAME);

    return { ok: true };
  });
}

// 카테고리 이름 바꾸기
export async function renameCategory(
  slugParam: string,
  idParam: unknown,
  values: Record<string, string>,
): Promise<ActionResult> {
  const shop = await requireManagedShop(slugParam);
  const id = parseCategoryId(idParam);

  const parsed = categoryRenameSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: INVALID_INPUT,
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  try {
    const [updated] = await db
      .update(categories)
      .set({ name: parsed.data.name })
      .where(inShop(shop.id, eq(categories.id, id)))
      .returning({ id: categories.id });
    return updated ? { ok: true } : NOT_FOUND;
  } catch (error) {
    if (pgErrorCode(error) !== PG_UNIQUE_VIOLATION) throw error;
    return {
      ok: false,
      error: INVALID_INPUT,
      fieldErrors: { name: DUPLICATE_NAME },
      values,
    };
  }
}

// 같은 단계 안에서 한 칸 위나 아래로 옮긴다.
export async function moveCategory(
  slugParam: string,
  idParam: unknown,
  directionParam: unknown,
): Promise<ActionResult> {
  const shop = await requireManagedShop(slugParam);
  const id = parseCategoryId(idParam);
  const direction = moveDirectionSchema.safeParse(directionParam);
  if (!direction.success) throw new Error("옮길 방향이 올바르지 않아요.");

  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ parentId: categories.parentId })
      .from(categories)
      .where(inShop(shop.id, eq(categories.id, id)));
    if (!target) return NOT_FOUND;

    // 동시에 순서를 바꾸는 요청이 섞이지 않게 같은 단계의 카테고리를 잠근다.
    const siblings = await tx
      .select({ id: categories.id, sortOrder: categories.sortOrder })
      .from(categories)
      .where(inShop(shop.id, sameParent(target.parentId)))
      .orderBy(asc(categories.sortOrder), asc(categories.id))
      .for("update");

    const order = moveInOrder(
      siblings.map((sibling) => sibling.id),
      id,
      direction.data,
    );
    // 이미 맨 위나 맨 아래면 할 일이 없다.
    if (!order) return { ok: true };

    // 순서 값이 겹쳐 있어도 바로잡히게, 자리가 바뀐 것만이 아니라 전체를 0부터 다시 매긴다.
    const current = new Map(siblings.map((s) => [s.id, s.sortOrder]));
    for (const [sortOrder, categoryId] of order.entries()) {
      if (current.get(categoryId) === sortOrder) continue;
      await tx
        .update(categories)
        .set({ sortOrder })
        .where(inShop(shop.id, eq(categories.id, categoryId)));
    }
    return { ok: true };
  });
}

// 카테고리 지우기. 하위 카테고리나 글(휴지통 포함)이 있으면 지울 수 없다.
export async function deleteCategory(
  slugParam: string,
  idParam: unknown,
): Promise<ActionResult> {
  const shop = await requireManagedShop(slugParam);
  const id = parseCategoryId(idParam);

  const [child] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inShop(shop.id, eq(categories.parentId, id)))
    .limit(1);
  if (child) {
    return {
      ok: false,
      error:
        "하위 카테고리가 있어서 지울 수 없어요. 하위 카테고리를 먼저 지워 주세요.",
    };
  }
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.shopId, shop.id), eq(posts.categoryId, id)))
    .limit(1);
  if (post) {
    return {
      ok: false,
      error:
        "이 카테고리에 글이 있어서 지울 수 없어요. 휴지통에 있는 글도 포함돼요.",
    };
  }

  try {
    const [deleted] = await db
      .delete(categories)
      .where(inShop(shop.id, eq(categories.id, id)))
      .returning({ id: categories.id });
    return deleted ? { ok: true } : NOT_FOUND;
  } catch (error) {
    // 위에서 확인한 직후에 글이나 하위 카테고리가 생긴 경우. DB 제약이 막아 준다.
    if (pgErrorCode(error) !== PG_FOREIGN_KEY_VIOLATION) throw error;
    return {
      ok: false,
      error: "글이나 하위 카테고리가 있어서 지울 수 없어요.",
    };
  }
}
