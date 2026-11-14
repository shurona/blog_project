import { THUMB_MAX_SIDE, type UploadType } from "./validation";

const EXTENSIONS: Record<UploadType, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

// 사진의 R2 key. 상점 번호 아래에 두어 다른 상점의 사진과 섞이지 않게 하고,
// 서버가 만든 무작위 번호(uploadId)를 써서 주소를 짐작하거나 덮어쓸 수 없게 한다.
export function imageKeys(
  shopId: number,
  uploadId: string,
  contentType: UploadType,
): { key: string; thumbKey: string } {
  const base = `shops/${shopId}/${uploadId}`;
  const extension = EXTENSIONS[contentType];
  return {
    key: `${base}.${extension}`,
    thumbKey: `${base}_${THUMB_MAX_SIDE}.${extension}`,
  };
}
