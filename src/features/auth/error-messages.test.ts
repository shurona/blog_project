import { describe, expect, it } from "vitest";

import { toAuthErrorMessage } from "./error-messages";

describe("toAuthErrorMessage", () => {
  it("틀린 아이디·비밀번호는 둘 중 무엇이 틀렸는지 알려주지 않는다", () => {
    expect(
      toAuthErrorMessage({ code: "INVALID_USERNAME_OR_PASSWORD", status: 401 }),
    ).toBe("아이디 또는 비밀번호가 맞지 않아요.");
  });

  it("시도 제한(429)은 잠시 후 다시 하라고 알려준다", () => {
    expect(toAuthErrorMessage({ status: 429 })).toContain("잠시 후");
  });

  it("모르는 오류는 일반 문장으로 보여준다", () => {
    expect(toAuthErrorMessage({ code: "SOMETHING_ELSE", status: 500 })).toBe(
      "처리하지 못했어요. 잠시 후 다시 시도해 주세요.",
    );
  });
});
