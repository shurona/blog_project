// Better Auth가 돌려주는 오류를 화면에 보여줄 한국어 문장으로 바꾼다.
export type AuthError = {
  code?: string;
  status: number;
};

const MESSAGES: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: "아이디 또는 비밀번호가 맞지 않아요.",
  INVALID_PASSWORD: "지금 비밀번호가 맞지 않아요.",
  PASSWORD_TOO_SHORT: "새 비밀번호가 너무 짧아요.",
  PASSWORD_TOO_LONG: "새 비밀번호가 너무 길어요.",
};

export function toAuthErrorMessage(error: AuthError): string {
  if (error.status === 429) {
    return "시도가 너무 많아요. 잠시 후 다시 시도해 주세요.";
  }
  return (
    (error.code && MESSAGES[error.code]) ??
    "처리하지 못했어요. 잠시 후 다시 시도해 주세요."
  );
}
