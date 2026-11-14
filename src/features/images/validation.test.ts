import { describe, expect, it } from "vitest";

import { imageKeys } from "./keys";
import {
  checkSourceFile,
  fitWithin,
  MAX_MAIN_BYTES,
  MAX_SOURCE_BYTES,
  MAX_THUMB_BYTES,
  uploadCompleteSchema,
  uploadRequestSchema,
} from "./validation";

describe("checkSourceFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("허용: %s", (type) => {
    expect(checkSourceFile({ type, size: 1024 })).toBeNull();
  });

  it.each([
    "image/gif",
    "image/heic",
    "image/svg+xml",
    "application/pdf",
    "text/html",
    "",
  ])("허용하지 않는 종류는 확장자를 안내한다: %s", (type) => {
    expect(checkSourceFile({ type, size: 1024 })).toBe(
      "JPG, PNG, WebP 확장자만 업로드 가능합니다.",
    );
  });

  it("20MB까지 받는다", () => {
    expect(
      checkSourceFile({ type: "image/jpeg", size: MAX_SOURCE_BYTES }),
    ).toBeNull();
  });

  it("20MB를 넘으면 거부한다", () => {
    expect(
      checkSourceFile({ type: "image/jpeg", size: MAX_SOURCE_BYTES + 1 }),
    ).toBe("20MB 이하의 사진만 업로드 가능합니다.");
  });
});

describe("fitWithin", () => {
  it("가로로 긴 사진은 가로를 맞춘다", () => {
    expect(fitWithin(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440 });
  });

  it("세로로 긴 사진은 세로를 맞춘다", () => {
    expect(fitWithin(3000, 4000, 640)).toEqual({ width: 480, height: 640 });
  });

  it("작은 사진은 키우지 않는다", () => {
    expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });

  it("아주 길쭉한 사진도 1px 아래로 내려가지 않는다", () => {
    expect(fitWithin(10000, 2, 640)).toEqual({ width: 640, height: 1 });
  });
});

describe("uploadRequestSchema", () => {
  const request = {
    contentType: "image/webp",
    sizeBytes: 300_000,
    thumbSizeBytes: 40_000,
  };

  it.each(["image/webp", "image/jpeg"])("허용: %s", (contentType) => {
    expect(
      uploadRequestSchema.safeParse({ ...request, contentType }).success,
    ).toBe(true);
  });

  it.each([
    ["PNG로 올리기", { contentType: "image/png" }],
    ["HTML로 올리기", { contentType: "text/html" }],
    ["본문용 크기 초과", { sizeBytes: MAX_MAIN_BYTES + 1 }],
    ["목록용 크기 초과", { thumbSizeBytes: MAX_THUMB_BYTES + 1 }],
    ["크기 0", { sizeBytes: 0 }],
    ["소수 크기", { sizeBytes: 1.5 }],
    ["글자로 온 크기", { sizeBytes: "300000" }],
  ])("거부(%s)", (_, change) => {
    expect(
      uploadRequestSchema.safeParse({ ...request, ...change }).success,
    ).toBe(false);
  });
});

describe("uploadCompleteSchema", () => {
  const uploadId = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

  it("서버가 만든 번호를 받는다", () => {
    expect(
      uploadCompleteSchema.safeParse({ uploadId, contentType: "image/webp" })
        .success,
    ).toBe(true);
  });

  it.each(["", "abc", "../../shops/1/x", `${uploadId}/../x`])(
    "번호 모양이 아니면 거부: %s",
    (value) => {
      expect(
        uploadCompleteSchema.safeParse({
          uploadId: value,
          contentType: "image/webp",
        }).success,
      ).toBe(false);
    },
  );
});

describe("imageKeys", () => {
  const uploadId = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

  it("상점 번호 아래에 본문용과 목록용 key를 만든다", () => {
    expect(imageKeys(7, uploadId, "image/webp")).toEqual({
      key: `shops/7/${uploadId}.webp`,
      thumbKey: `shops/7/${uploadId}_640.webp`,
    });
  });

  it("JPEG는 확장자가 jpg다", () => {
    expect(imageKeys(7, uploadId, "image/jpeg").key).toBe(
      `shops/7/${uploadId}.jpg`,
    );
  });

  it("상점이 다르면 key가 겹치지 않는다", () => {
    expect(imageKeys(1, uploadId, "image/webp").key).not.toBe(
      imageKeys(2, uploadId, "image/webp").key,
    );
  });
});
