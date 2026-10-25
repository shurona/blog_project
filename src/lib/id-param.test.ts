import { describe, expect, it } from "vitest";
import { idParamSchema } from "./id-param";

describe("idParamSchema", () => {
  it("숫자 문자열을 번호로 바꾼다", () => {
    expect(idParamSchema.parse("42")).toBe(42);
  });

  it("DB integer의 최댓값까지 받는다", () => {
    expect(idParamSchema.parse("2147483647")).toBe(2147483647);
  });

  it.each([
    "",
    "0",
    "007",
    "-1",
    "1.5",
    "abc",
    "1e3",
    "0x10",
    "2147483648",
    "99999999999",
  ])("거부: %s", (value) => {
    expect(idParamSchema.safeParse(value).success).toBe(false);
  });
});
