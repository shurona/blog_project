import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  // 세션 쿠키 서명용 비밀 키. `openssl rand -base64 32`로 만든다.
  BETTER_AUTH_SECRET: z.string().min(32),
  // 사이트 주소. 로컬은 http://localhost:3000
  BETTER_AUTH_URL: z.url(),
  // Cloudflare R2(사진 저장). 접속 키는 객체 읽기·쓰기 권한의 API 토큰에서 나온다.
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  // 사진을 보여줄 때 쓰는 버킷 공개 주소. 뒤에 key를 붙여 쓰므로 /로 끝나면 안 된다.
  R2_PUBLIC_URL: z.url().refine((url) => !url.endsWith("/")),
});

// 서버 코드에서 쓰는 환경 변수는 여기서 한 번에 검사한 뒤 가져다 쓴다.
export const env = envSchema.parse(process.env);
