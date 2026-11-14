import { z } from "zod";

// 관리자가 고를 수 있는 원본 사진. 움직이는 GIF와 HEIC는 받지 않는다.
export const SOURCE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
// 원본은 브라우저에서 줄인 뒤 올리므로 서버나 R2로 가지 않는다.
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

// R2에 올리는 파일. 브라우저가 WebP를 만들 수 있으면 WebP, 못 만들면(사파리·아이폰) JPEG다.
export const UPLOAD_TYPES = ["image/webp", "image/jpeg"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];

// 긴 변 기준 크기(px). 본문용과 목록용 두 장을 만든다.
export const MAIN_MAX_SIDE = 1920;
export const THUMB_MAX_SIDE = 640;
// 줄인 뒤의 파일 크기 한도. 보통은 이보다 훨씬 작다.
export const MAX_MAIN_BYTES = 5 * 1024 * 1024;
export const MAX_THUMB_BYTES = 1024 * 1024;

// 고른 파일을 올릴 수 있는지 본다. 올릴 수 없으면 안내 메시지를 돌려준다.
export function checkSourceFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!(SOURCE_TYPES as readonly string[]).includes(file.type)) {
    return "JPG, PNG, WebP 확장자만 업로드 가능합니다.";
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return "20MB 이하의 사진만 업로드 가능합니다.";
  }
  return null;
}

// 가로·세로 비율을 지키면서 긴 변이 maxSide를 넘지 않게 줄인 크기. 작은 사진은 키우지 않는다.
export function fitWithin(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

// 업로드 주소를 달라는 요청
export const uploadRequestSchema = z.object({
  contentType: z.enum(UPLOAD_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_MAIN_BYTES),
  thumbSizeBytes: z.number().int().positive().max(MAX_THUMB_BYTES),
});

// 다 올렸다는 알림
export const uploadCompleteSchema = z.object({
  uploadId: z.uuid(),
  contentType: z.enum(UPLOAD_TYPES),
});
