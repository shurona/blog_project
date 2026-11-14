import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// 화면에서 Better Auth 주소(/api/auth/...)를 부르는 함수.
// 로그인·로그아웃·비밀번호 변경에만 쓴다. 그 밖의 데이터 쓰기는 서버 액션으로 한다.
export const authClient = createAuthClient({
  plugins: [usernameClient()],
});
