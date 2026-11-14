import "server-only";

import { and, eq } from "drizzle-orm";

import { getAdminPrincipal } from "@/features/auth/dal";
import { requireManagedShop } from "@/features/shops/dal";
import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { createUploadUrl, deleteObjects, readObjectStart } from "@/server/r2";

import { toUploadedImage, type UploadedImage } from "./dto";
import { HEADER_BYTES, readImageHeader } from "./image-header";
import { imageKeys } from "./keys";
import {
  MAIN_MAX_SIDE,
  MAX_MAIN_BYTES,
  MAX_THUMB_BYTES,
  THUMB_MAX_SIDE,
  uploadCompleteSchema,
  uploadRequestSchema,
} from "./validation";

type Failure = { ok: false; error: string };

export type ImageUploadTicket =
  | {
      ok: true;
      uploadId: string;
      // 본문용과 목록용 파일을 각각 올릴 주소
      uploadUrl: string;
      thumbUploadUrl: string;
    }
  | Failure;

export type ImageUploadResult = { ok: true; image: UploadedImage } | Failure;

const imageColumns = {
  id: images.id,
  key: images.key,
  thumbKey: images.thumbKey,
  width: images.width,
  height: images.height,
};

// 1단계: 업로드 주소 발급. 그 상점을 관리할 수 있는 사람에게만 내준다.
export async function createImageUpload(
  slugParam: string,
  input: unknown,
): Promise<ImageUploadTicket> {
  const shop = await requireManagedShop(slugParam);

  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) {
    // 화면은 WebP와 JPEG만 보내므로, 종류가 틀린 요청은 화면을 거치지 않은 것이다.
    if (parsed.error.issues.some((issue) => issue.path[0] === "contentType")) {
      throw new Error("올릴 수 없는 파일 종류예요.");
    }
    return {
      ok: false,
      error: "사진 파일이 너무 커요. 다른 사진으로 다시 올려 주세요.",
    };
  }
  const { contentType, sizeBytes, thumbSizeBytes } = parsed.data;

  const uploadId = crypto.randomUUID();
  const { key, thumbKey } = imageKeys(shop.id, uploadId, contentType);
  const [uploadUrl, thumbUploadUrl] = await Promise.all([
    createUploadUrl({ key, contentType, sizeBytes }),
    createUploadUrl({ key: thumbKey, contentType, sizeBytes: thumbSizeBytes }),
  ]);
  return { ok: true, uploadId, uploadUrl, thumbUploadUrl };
}

// 2단계: 브라우저가 다 올린 뒤 부른다. 올라온 파일을 직접 확인하고 DB에 기록한다.
export async function completeImageUpload(
  slugParam: string,
  input: unknown,
): Promise<ImageUploadResult> {
  const shop = await requireManagedShop(slugParam);
  const admin = await getAdminPrincipal();

  const parsed = uploadCompleteSchema.safeParse(input);
  if (!parsed.success) throw new Error("업로드 번호가 올바르지 않아요.");
  const { uploadId, contentType } = parsed.data;
  // key를 상점 번호로 다시 만들기 때문에, 다른 상점에 올라온 파일은 등록할 수 없다.
  const { key, thumbKey } = imageKeys(shop.id, uploadId, contentType);

  const [main, thumb] = await Promise.all([
    readObjectStart(key, HEADER_BYTES),
    readObjectStart(thumbKey, HEADER_BYTES),
  ]);
  if (!main || !thumb) {
    return { ok: false, error: "사진이 올라오지 않았어요. 다시 올려 주세요." };
  }

  // 종류와 크기는 브라우저가 알려준 값이 아니라 올라온 파일에서 읽는다.
  const mainHeader = readImageHeader(main.bytes);
  const thumbHeader = readImageHeader(thumb.bytes);
  const valid =
    mainHeader?.contentType === contentType &&
    thumbHeader?.contentType === contentType &&
    Math.max(mainHeader.width, mainHeader.height) <= MAIN_MAX_SIDE &&
    Math.max(thumbHeader.width, thumbHeader.height) <= THUMB_MAX_SIDE &&
    main.sizeBytes <= MAX_MAIN_BYTES &&
    thumb.sizeBytes <= MAX_THUMB_BYTES;
  if (!valid) {
    await deleteObjects([key, thumbKey]);
    return {
      ok: false,
      error: "사진 파일을 확인할 수 없어요. 다른 사진으로 다시 올려 주세요.",
    };
  }

  const [created] = await db
    .insert(images)
    .values({
      shopId: shop.id,
      key,
      thumbKey,
      width: mainHeader.width,
      height: mainHeader.height,
      sizeBytes: main.sizeBytes,
      contentType,
      uploadedBy: admin.id,
    })
    .onConflictDoNothing({ target: images.key })
    .returning(imageColumns);
  if (created) return { ok: true, image: toUploadedImage(created) };

  // 같은 알림이 두 번 온 경우. 이미 기록한 사진을 그대로 돌려준다.
  const [existing] = await db
    .select(imageColumns)
    .from(images)
    .where(and(eq(images.shopId, shop.id), eq(images.key, key)));
  if (!existing) throw new Error("사진을 기록하지 못했어요.");
  return { ok: true, image: toUploadedImage(existing) };
}
