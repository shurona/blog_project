import { describe, expect, it } from "vitest";

import {
  RESERVED_SHOP_SLUGS,
  shopFieldsSchema,
  shopSlugSchema,
} from "./validation";

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

describe("shopFieldsSchema", () => {
  const empty = {
    name: "솔바람 콘도",
    type: "condo",
    intro: "",
    description: "",
    address: "",
    businessHours: "",
    phone: "",
    kakaoChannelUrl: "",
    instagramUrl: "",
    naverMapUrl: "",
    kakaoMapUrl: "",
  };

  it("비워 둔 칸은 null로 바꾼다", () => {
    const result = shopFieldsSchema.parse(empty);
    expect(result.intro).toBeNull();
    expect(result.instagramUrl).toBeNull();
  });

  it("앞뒤 공백을 지운다", () => {
    expect(shopFieldsSchema.parse({ ...empty, name: "  솔바람  " }).name).toBe(
      "솔바람",
    );
  });

  it.each(["https://pf.kakao.com/_abc", "http://example.com/map?q=1"])(
    "링크 허용: %s",
    (url) => {
      expect(
        shopFieldsSchema.safeParse({ ...empty, kakaoChannelUrl: url }).success,
      ).toBe(true);
    },
  );

  it.each([
    "javascript:alert(1)",
    "ftp://example.com",
    "pf.kakao.com/_abc",
    "https://exa mple.com",
  ])("위험하거나 잘못된 링크 거부: %s", (url) => {
    expect(
      shopFieldsSchema.safeParse({ ...empty, instagramUrl: url }).success,
    ).toBe(false);
  });

  it.each([
    ["이름 없음", { name: "  " }],
    ["모르는 종류", { type: "hotel" }],
    ["짧은 소개 200자 초과", { intro: "가".repeat(201) }],
    ["전화번호에 글자", { phone: "010-abcd-1234" }],
  ])("거부(%s)", (_, change) => {
    expect(shopFieldsSchema.safeParse({ ...empty, ...change }).success).toBe(
      false,
    );
  });

  it("전화번호는 숫자와 하이픈을 받는다", () => {
    expect(
      shopFieldsSchema.parse({ ...empty, phone: "064-123-4567" }).phone,
    ).toBe("064-123-4567");
  });
});
