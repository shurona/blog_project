import { z } from "zod";

import { idParamSchema } from "@/lib/id-param";

// 사이드바에 한 줄로 들어가는 길이
export const CATEGORY_NAME_MAX = 30;

const categoryNameSchema = z
  .string("카테고리 이름을 입력해 주세요.")
  .trim()
  .min(1, "카테고리 이름을 입력해 주세요.")
  .max(CATEGORY_NAME_MAX, `${CATEGORY_NAME_MAX}자까지 쓸 수 있어요.`);

// 카테고리 만들기. parentId가 없으면 위 단계 카테고리다.
export const categoryCreateSchema = z.object({
  name: categoryNameSchema,
  parentId: idParamSchema.optional(),
});

export const categoryRenameSchema = z.object({ name: categoryNameSchema });

// 서버 액션에 묶어 보낸 카테고리 번호. 화면을 거치지 않은 요청일 수 있어 다시 검사한다.
export const categoryIdSchema = z.number().int().positive().max(2_147_483_647);

export const MOVE_DIRECTIONS = ["up", "down"] as const;
export type MoveDirection = (typeof MOVE_DIRECTIONS)[number];
export const moveDirectionSchema = z.enum(MOVE_DIRECTIONS);
