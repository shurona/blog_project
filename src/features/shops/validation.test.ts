import { describe, expect, it } from "vitest";
import { RESERVED_SHOP_SLUGS, shopSlugSchema } from "./validation";

describe("shopSlugSchema", () => {
  it.each(["abc", "my-shop", "golf-123"])("허용: %s", (slug) => {
    expect(shopSlugSchema.safeParse(slug).success).toBe(true);
  });

  it.each([
    ["3자 미만", "ab"],
    ["30자 초과", "a".repeat(31)],
    ["대문자", "My-Shop"],
    ["한글", "상점주소"],
    ["밑줄", "my_shop"],
    ["하이픈으로 시작", "-shop"],
    ["하이픈으로 끝남", "shop-"],
    ["하이픈 연속", "my--shop"],
  ])("거부(%s): %s", (_, slug) => {
    expect(shopSlugSchema.safeParse(slug).success).toBe(false);
  });

  it.each(RESERVED_SHOP_SLUGS)("예약어 거부: %s", (slug) => {
    expect(shopSlugSchema.safeParse(slug).success).toBe(false);
  });
});
