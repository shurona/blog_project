import { describe, expect, it } from "vitest";

import { readImageHeader } from "./image-header";

const ascii = (value: string) => [...value].map((char) => char.charCodeAt(0));
const le = (value: number, byteCount: number) =>
  Array.from({ length: byteCount }, (_, i) => (value >>> (8 * i)) & 0xff);
const be16 = (value: number) => [(value >> 8) & 0xff, value & 0xff];

// "RIFF" + 파일 크기 + "WEBP" + 조각 이름 + 조각 크기 + 조각 내용
const webp = (chunk: string, data: number[]) =>
  new Uint8Array([
    ...ascii("RIFF"),
    ...le(0, 4),
    ...ascii("WEBP"),
    ...ascii(chunk),
    ...le(data.length, 4),
    ...data,
    ...new Array<number>(16).fill(0),
  ]);

const lossyWebp = (width: number, height: number) =>
  webp("VP8 ", [0, 0, 0, 0x9d, 0x01, 0x2a, ...le(width, 2), ...le(height, 2)]);
const losslessWebp = (width: number, height: number) =>
  webp("VP8L", [0x2f, ...le((width - 1) | ((height - 1) << 14), 4)]);
const extendedWebp = (width: number, height: number) =>
  webp("VP8X", [0, 0, 0, 0, ...le(width - 1, 3), ...le(height - 1, 3)]);

// 시작 표시 + 앞에 오는 조각들 + 크기 조각(SOF)
const jpeg = (width: number, height: number, sofMarker = 0xc0) =>
  new Uint8Array([
    0xff,
    0xd8,
    // JFIF 조각
    ...[0xff, 0xe0, ...be16(16), ...new Array<number>(14).fill(0)],
    // 양자화 표 조각
    ...[0xff, 0xdb, ...be16(67), ...new Array<number>(65).fill(1)],
    ...[0xff, sofMarker, ...be16(17), 8, ...be16(height), ...be16(width)],
    ...new Array<number>(12).fill(0),
  ]);

describe("readImageHeader", () => {
  it.each([
    ["손실 WebP", lossyWebp(1920, 1080)],
    ["무손실 WebP", losslessWebp(1920, 1080)],
    ["확장 WebP", extendedWebp(1920, 1080)],
  ])("%s의 크기를 읽는다", (_, bytes) => {
    expect(readImageHeader(bytes)).toEqual({
      contentType: "image/webp",
      width: 1920,
      height: 1080,
    });
  });

  it("세로로 긴 WebP도 읽는다", () => {
    expect(readImageHeader(lossyWebp(480, 640))).toMatchObject({
      width: 480,
      height: 640,
    });
  });

  it.each([
    ["기본 JPEG", 0xc0],
    ["프로그레시브 JPEG", 0xc2],
  ])("%s의 크기를 읽는다", (_, marker) => {
    expect(readImageHeader(jpeg(1920, 1280, marker))).toEqual({
      contentType: "image/jpeg",
      width: 1920,
      height: 1280,
    });
  });

  it.each([
    ["빈 파일", new Uint8Array()],
    ["PNG", new Uint8Array([0x89, ...ascii("PNG\r\n"), 0x1a, 0x0a, 0, 0, 0])],
    ["HTML", new Uint8Array(ascii("<!doctype html><script>alert(1)</script>"))],
    [
      "WebP가 아닌 RIFF 파일",
      new Uint8Array([
        ...ascii("RIFF"),
        ...le(0, 4),
        ...ascii("WAVEfmt "),
        ...new Array<number>(20).fill(0),
      ]),
    ],
    ["조각 이름을 모르는 WebP", webp("ABCD", new Array<number>(10).fill(0))],
    ["시작 코드가 틀린 손실 WebP", webp("VP8 ", new Array<number>(10).fill(0))],
    ["크기 조각이 없는 JPEG", jpeg(100, 100).slice(0, 40)],
    ["크기가 0인 JPEG", jpeg(0, 100)],
  ])("사진이 아니면 null(%s)", (_, bytes) => {
    expect(readImageHeader(bytes)).toBeNull();
  });
});
