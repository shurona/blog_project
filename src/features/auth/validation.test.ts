import { describe, expect, it } from "vitest";

import { changePasswordSchema, loginSchema } from "./validation";

describe("loginSchema", () => {
  it("아이디 앞뒤 공백은 지운다", () => {
    expect(
      loginSchema.parse({ username: " admin ", password: "pw" }).username,
    ).toBe("admin");
  });

  it.each([
    ["아이디 없음", { username: " ", password: "pw" }],
    ["비밀번호 없음", { username: "admin", password: "" }],
  ])("거부(%s)", (_, input) => {
    expect(loginSchema.safeParse(input).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "old-password",
    newPassword: "new-password-1",
    confirmPassword: "new-password-1",
  };

  it("올바른 입력은 통과한다", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    [
      "새 비밀번호가 10자 미만",
      { newPassword: "short", confirmPassword: "short" },
    ],
    ["확인이 다름", { confirmPassword: "different-1" }],
    [
      "지금 비밀번호와 같음",
      { newPassword: "old-password", confirmPassword: "old-password" },
    ],
    ["지금 비밀번호 없음", { currentPassword: "" }],
  ])("거부(%s)", (_, change) => {
    expect(
      changePasswordSchema.safeParse({ ...valid, ...change }).success,
    ).toBe(false);
  });
});
