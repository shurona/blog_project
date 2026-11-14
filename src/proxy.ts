import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// 로그인 쿠키가 없으면 관리자 페이지를 그리기 전에 로그인 화면으로 보낸다.
// 쿠키가 있는지만 보는 1차 확인이다. 쿠키가 진짜인지와 권한은 DAL에서 다시 확인한다.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  // /admin과 그 아래 페이지. 로그인 화면은 뺀다.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
