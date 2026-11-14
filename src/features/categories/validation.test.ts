import { describe, expect, it } from "vitest";

import {
  categoryCreateSchema,
  categoryIdSchema,
  categoryRenameSchema,
  moveDirectionSchema,
} from "./validation";

describe("categoryCreateSchema", () => {
  it("상위 번호가 없으면 위 단계 카테고리다", () => {
    expect(categoryCreateSchema.parse({ name: "제주" })).toEqual({
      name: "제주",
    });
  });

  it("상위 번호를 숫자로 바꾼다", () => {
    expect(
      categoryCreateSchema.parse({ name: "제주", parentId: "12" }).parentId,
    ).toBe(12);
  });

  it("이름 앞뒤 공백을 지운다", () => {
    expect(categoryCreateSchema.parse({ name: "  제주  " }).name).toBe("제주");
  });

  it.each([
    ["이름 없음", { name: "   " }],
    ["이름 30자 초과", { name: "가".repeat(31) }],
    ["숫자가 아닌 상위 번호", { name: "제주", parentId: "abc" }],
    ["0인 상위 번호", { name: "제주", parentId: "0" }],
    ["범위를 넘는 상위 번호", { name: "제주", parentId: "2147483648" }],
  ])("거부(%s)", (_, input) => {
    expect(categoryCreateSchema.safeParse(input).success).toBe(false);
  });

  it("이름 30자는 허용한다", () => {
    expect(
      categoryCreateSchema.safeParse({ name: "가".repeat(30) }).success,
    ).toBe(true);
  });
});

describe("categoryRenameSchema", () => {
  it("빈 이름을 거부한다", () => {
    expect(categoryRenameSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("categoryIdSchema", () => {
  it.each([0, -1, 1.5, 2_147_483_648, Number.NaN])("거부: %s", (id) => {
    expect(categoryIdSchema.safeParse(id).success).toBe(false);
  });

  it("글자로 온 번호를 거부한다", () => {
    expect(categoryIdSchema.safeParse("3").success).toBe(false);
  });

  it("양의 정수를 받는다", () => {
    expect(categoryIdSchema.parse(3)).toBe(3);
  });
});

describe("moveDirectionSchema", () => {
  it("up과 down만 받는다", () => {
    expect(moveDirectionSchema.safeParse("up").success).toBe(true);
    expect(moveDirectionSchema.safeParse("down").success).toBe(true);
    expect(moveDirectionSchema.safeParse("left").success).toBe(false);
  });
});
