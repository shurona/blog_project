import type { BetterAuthOptions } from "better-auth";
import { username } from "better-auth/plugins";

// Better Auth CLI가 이 파일을 직접 읽기 때문에 '@/' 별칭 대신 상대 경로로 가져온다.
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../../features/auth/password-policy";

// 테이블 모양에 영향을 주는 Better Auth 설정. 실제 로그인 설정과 테이블 정의 생성(cli.ts)이 함께 쓴다.
export const authOptions = {
  emailAndPassword: {
    enabled: true,
    // 회원가입은 없다. 관리자 계정은 전체 관리자가 만든다.
    disableSignUp: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },
  // 관리자는 이메일이 아니라 아이디로 로그인한다. 이메일은 로그인에 쓰지 않는 별도 정보다.
  plugins: [username()],
  user: {
    additionalFields: {
      isSuperAdmin: {
        type: "boolean",
        required: true,
        defaultValue: false,
        // 로그인·계정 API로는 바꿀 수 없게 한다.
        input: false,
      },
      // 임시 비밀번호로 만든 계정은 첫 로그인 때 비밀번호를 바꿔야 한다.
      mustChangePassword: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  // 로그인 시도 제한(운영 환경에서만 켜진다). 서버가 여러 대로 나뉘는 Vercel에서도
  // 같은 기록을 보도록 메모리 대신 DB에 저장한다.
  rateLimit: {
    storage: "database",
  },
} satisfies BetterAuthOptions;
