import { describe, expect, it } from "vitest";
import { formatKoreanDate } from "./date";

describe("formatKoreanDate", () => {
  it("UTC 시각을 한국 날짜로 바꾼다", () => {
    expect(formatKoreanDate("2026-10-20T03:00:00Z")).toBe("2026. 10. 20.");
  });

  it("UTC로는 전날이어도 한국 시간 기준 날짜를 쓴다", () => {
    expect(formatKoreanDate("2026-10-19T15:00:00Z")).toBe("2026. 10. 20.");
    expect(formatKoreanDate("2026-10-19T14:59:59Z")).toBe("2026. 10. 19.");
  });
});
