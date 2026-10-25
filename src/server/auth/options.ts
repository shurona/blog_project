import type { BetterAuthOptions } from "better-auth";

// 테이블 모양에 영향을 주는 Better Auth 설정. 실제 로그인 설정과 테이블 정의 생성(cli.ts)이 함께 쓴다.
export const authOptions = {
  emailAndPassword: {
    enabled: true,
    // 회원가입은 없다. 관리자 계정은 전체 관리자가 만든다.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      isSuperAdmin: {
        type: "boolean",
        required: true,
        defaultValue: false,
        // 로그인·계정 API로는 바꿀 수 없게 한다.
        input: false,
      },
    },
  },
} satisfies BetterAuthOptions;
