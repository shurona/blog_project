// Better Auth CLI가 테이블 정의(src/server/db/schema/auth.ts)를 만들 때만 읽는 설정.
// CLI는 server-only가 들어간 파일을 읽지 못해서, DB 연결 없이 공통 옵션만 쓴다. 앱에서는 쓰지 않는다.
import { betterAuth } from "better-auth";
import { authOptions } from "./options";

export const auth = betterAuth(authOptions);
