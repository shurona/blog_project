import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { env } from "@/server/env";

import { authOptions } from "./options";

// 앱에서 쓰는 실제 로그인 설정. 테이블 모양에 영향을 주는 옵션은 options.ts에 둔다.
export const auth = betterAuth({
  ...authOptions,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // nextCookies는 서버 액션에서 로그인할 때 쿠키를 심어 준다. 항상 마지막에 둔다.
  plugins: [...authOptions.plugins, nextCookies()],
});
