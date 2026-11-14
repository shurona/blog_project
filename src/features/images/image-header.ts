import type { UploadType } from "./validation";

// 파일 앞부분에서 사진 종류와 크기를 읽는다. 브라우저가 알려준 값을 믿지 않고
// 올라온 파일을 서버에서 직접 확인하려고 쓴다. WebP나 JPEG가 아니면 null이다.

// JPEG는 크기 정보가 색상 정보(ICC) 뒤에 올 수 있어서 넉넉하게 읽는다.
export const HEADER_BYTES = 64 * 1024;

export type ImageHeader = {
  contentType: UploadType;
  width: number;
  height: number;
};

export function readImageHeader(bytes: Uint8Array): ImageHeader | null {
  const size = readWebpSize(bytes) ?? readJpegSize(bytes);
  if (!size || size.width < 1 || size.height < 1) return null;
  return size;
}

function text(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

// WebP: "RIFF" + 파일 크기 + "WEBP" 뒤에 첫 조각이 온다. 조각 종류에 따라 크기 위치가 다르다.
function readWebpSize(bytes: Uint8Array): ImageHeader | null {
  if (bytes.length < 30) return null;
  if (text(bytes, 0, 4) !== "RIFF" || text(bytes, 8, 4) !== "WEBP") return null;
  const contentType = "image/webp" as const;

  switch (text(bytes, 12, 4)) {
    // 손실 압축
    case "VP8 ": {
      if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) {
        return null;
      }
      return {
        contentType,
        width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
        height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
      };
    }
    // 무손실 압축. 가로·세로에서 1을 뺀 값이 14비트씩 이어져 있다.
    case "VP8L": {
      if (bytes[20] !== 0x2f) return null;
      const bits =
        bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return {
        contentType,
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
    // 확장 형식(투명도 등). 가로·세로에서 1을 뺀 값이 3바이트씩 있다.
    case "VP8X":
      return {
        contentType,
        width: (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1,
        height: (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1,
      };
    default:
      return null;
  }
}

// JPEG: 조각을 차례로 건너뛰다가 크기가 적힌 조각(SOF)을 찾는다.
function readJpegSize(bytes: Uint8Array): ImageHeader | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    // 조각 사이를 채우는 0xFF는 건너뛴다.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return null;
    // SOF0~SOF15 가운데 표(C4, CC)와 예약 값(C8)을 뺀 것이 크기 조각이다.
    const isSizeSegment =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isSizeSegment) {
      return {
        contentType: "image/jpeg",
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    offset += 2 + length;
  }
  return null;
}
