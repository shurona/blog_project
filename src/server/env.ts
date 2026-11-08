import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  // 세션 쿠키 서명용 비밀 키. `openssl rand -base64 32`로 만든다.
  BETTER_AUTH_SECRET: z.string().min(32),
  // 사이트 주소. 로컬은 http://localhost:3000
  BETTER_AUTH_URL: z.url(),
});

// 서버 코드에서 쓰는 환경 변수는 여기서 한 번에 검사한 뒤 가져다 쓴다.
export const env = envSchema.parse(process.env);
