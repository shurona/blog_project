import "server-only";

import { publicUrl } from "@/server/r2";

// 화면에 넘기는 사진 정보. R2 key 대신 바로 쓸 수 있는 주소를 담는다.
export type UploadedImage = {
  id: number;
  // 본문용(긴 변 1920px)
  url: string;
  // 목록용(긴 변 640px)
  thumbUrl: string;
  // 본문용 사진의 크기
  width: number;
  height: number;
};

export function toUploadedImage(row: {
  id: number;
  key: string;
  thumbKey: string;
  width: number;
  height: number;
}): UploadedImage {
  return {
    id: row.id,
    url: publicUrl(row.key),
    thumbUrl: publicUrl(row.thumbKey),
    width: row.width,
    height: row.height,
  };
}
