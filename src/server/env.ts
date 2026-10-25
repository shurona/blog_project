import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
});

// 서버 코드에서 쓰는 환경 변수는 여기서 한 번에 검사한 뒤 가져다 쓴다.
export const env = envSchema.parse(process.env);
