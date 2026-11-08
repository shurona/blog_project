import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";

// Better Auth가 로그인·로그아웃·세션 요청을 받는 주소(/api/auth/...).
export const { GET, POST } = toNextJsHandler(auth);
