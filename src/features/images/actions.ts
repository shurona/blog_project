"use server";

import {
  completeImageUpload,
  createImageUpload,
  type ImageUploadResult,
  type ImageUploadTicket,
} from "./dal";
import type { UploadType } from "./validation";

// 서버 액션은 DAL을 부르기만 한다. 권한 확인과 입력 검사는 DAL에서 한다.

export async function createImageUploadAction(
  slug: string,
  input: { contentType: UploadType; sizeBytes: number; thumbSizeBytes: number },
): Promise<ImageUploadTicket> {
  return createImageUpload(slug, input);
}

export async function completeImageUploadAction(
  slug: string,
  input: { uploadId: string; contentType: UploadType },
): Promise<ImageUploadResult> {
  return completeImageUpload(slug, input);
}
