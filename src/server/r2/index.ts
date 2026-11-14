import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/server/env";

// R2는 S3와 같은 방식으로 접속한다.
const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  // SDK가 기본으로 붙이는 체크섬 값은 브라우저가 직접 올리는 요청에는 넣을 수 없어서 끈다.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// 업로드 주소가 살아 있는 시간(초). 브라우저가 받자마자 올리므로 짧게 둔다.
const UPLOAD_URL_TTL_SECONDS = 300;

// 브라우저가 R2에 직접 올릴 때 쓰는 주소. 파일 종류와 크기를 서명에 넣어서,
// 발급받을 때 말한 것과 다른 종류나 크기의 파일은 R2가 거부한다.
export function createUploadUrl({
  key,
  contentType,
  sizeBytes,
}: {
  key: string;
  contentType: string;
  sizeBytes: number;
}): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    }),
    {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );
}

// 올라온 파일의 앞부분과 전체 크기. 파일이 없으면 null이다.
export async function readObjectStart(
  key: string,
  byteCount: number,
): Promise<{ bytes: Uint8Array; sizeBytes: number } | null> {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Range: `bytes=0-${byteCount - 1}`,
      }),
    );
    if (!response.Body) return null;
    const bytes = await response.Body.transformToByteArray();
    // Content-Range는 "bytes 0-29/12345" 모양이고, 마지막 숫자가 전체 크기다.
    const total = Number(response.ContentRange?.split("/")[1]);
    return { bytes, sizeBytes: Number.isFinite(total) ? total : bytes.length };
  } catch (error) {
    // 없는 파일이거나 빈 파일(범위 요청 불가)이면 올라오지 않은 것으로 본다.
    const name = error instanceof Error ? error.name : "";
    if (name === "NoSuchKey" || name === "InvalidRange") return null;
    throw error;
  }
}

export async function deleteObjects(keys: readonly string[]): Promise<void> {
  await Promise.all(
    keys.map((key) =>
      client.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
      ),
    ),
  );
}

// 사진을 보여줄 때 쓰는 주소
export function publicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`;
}
