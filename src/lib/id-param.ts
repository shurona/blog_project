import { z } from "zod";

// DB의 integer 칸에 넣을 수 있는 가장 큰 값
const MAX_INTEGER_ID = 2_147_483_647;

// 주소에 들어가는 숫자 번호(글 번호, 카테고리 번호). 0으로 시작하지 않는 양의 정수만 받는다(예: "42").
// DB의 integer 범위를 넘는 번호는 DB에 묻기 전에 거른다.
export const idParamSchema = z
  .string()
  .regex(/^[1-9]\d{0,9}$/)
  .transform(Number)
  .refine((id) => id <= MAX_INTEGER_ID);
