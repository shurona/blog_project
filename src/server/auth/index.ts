import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, isAPIError } from "better-auth/api";
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
  hooks: {
    // 비밀번호 변경이 성공했을 때만 "첫 로그인 비밀번호 변경 필요" 표시를 지운다.
    // 이 표시는 화면에서 바꿀 수 없어서(input: false) 서버에서만 지운다.
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/change-password") return;
      if (isAPIError(ctx.context.returned)) return;
      const userId = ctx.context.session?.user.id;
      if (!userId) return;
      await ctx.context.internalAdapter.updateUser(userId, {
        mustChangePassword: false,
      });
    }),
  },
  // nextCookies는 서버 쪽에서 Better Auth를 부를 때 쿠키를 심어 준다. 항상 마지막에 둔다.
  plugins: [...authOptions.plugins, nextCookies()],
});
