import { completeImageUploadAction, createImageUploadAction } from "./actions";
import type { ImageUploadResult } from "./dal";
import {
  checkSourceFile,
  fitWithin,
  MAIN_MAX_SIDE,
  THUMB_MAX_SIDE,
  type UploadType,
} from "./validation";

// 브라우저에서만 쓰는 함수. 사진을 줄여서 R2에 직접 올리고, 서버에 기록을 맡긴다.

// 화질(0~1). 눈에 띄는 차이 없이 파일을 줄이는 값이다.
const QUALITY = 0.82;

const fail = (error: string): ImageUploadResult => ({ ok: false, error });

export async function uploadImage(
  shopSlug: string,
  file: File,
): Promise<ImageUploadResult> {
  const sourceError = checkSourceFile(file);
  if (sourceError) return fail(sourceError);

  const resized = await resize(file);
  if (!resized) return fail("사진을 읽을 수 없어요. 다른 파일을 골라 주세요.");
  const { contentType, main, thumb } = resized;

  const ticket = await createImageUploadAction(shopSlug, {
    contentType,
    sizeBytes: main.size,
    thumbSizeBytes: thumb.size,
  });
  if (!ticket.ok) return ticket;

  try {
    const responses = await Promise.all([
      put(ticket.uploadUrl, main, contentType),
      put(ticket.thumbUploadUrl, thumb, contentType),
    ]);
    if (responses.some((response) => !response.ok)) throw new Error();
  } catch {
    return fail("사진을 올리지 못했어요. 잠시 뒤에 다시 해 주세요.");
  }

  return completeImageUploadAction(shopSlug, {
    uploadId: ticket.uploadId,
    contentType,
  });
}

function put(url: string, body: Blob, contentType: string): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
}

// 본문용과 목록용 두 장으로 줄인다. 사진으로 읽을 수 없는 파일이면 null이다.
async function resize(
  file: File,
): Promise<{ contentType: UploadType; main: Blob; thumb: Blob } | null> {
  let bitmap: ImageBitmap;
  try {
    // 휴대폰 사진에 적힌 회전 정보를 반영해서 읽는다.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }
  try {
    // 사파리와 아이폰은 WebP로 저장하지 못하고 다른 형식을 돌려준다. 그때는 JPEG로 만든다.
    let contentType: UploadType = "image/webp";
    let main = await encode(bitmap, MAIN_MAX_SIDE, contentType);
    if (main?.type !== contentType) {
      contentType = "image/jpeg";
      main = await encode(bitmap, MAIN_MAX_SIDE, contentType);
    }
    const thumb = await encode(bitmap, THUMB_MAX_SIDE, contentType);
    if (main?.type !== contentType || thumb?.type !== contentType) return null;
    return { contentType, main, thumb };
  } finally {
    bitmap.close();
  }
}

function encode(
  bitmap: ImageBitmap,
  maxSide: number,
  contentType: UploadType,
): Promise<Blob | null> {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  // JPEG에는 투명한 부분이 없어서, 투명한 곳이 검게 나오지 않게 흰색을 먼저 깐다.
  if (contentType === "image/jpeg") {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, contentType, QUALITY));
}
