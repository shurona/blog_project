// PostgreSQL 오류 코드. DB 제약에 걸린 실패를 사용자 안내 메시지로 바꿀 때 쓴다.
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";

// Drizzle은 DB 오류를 한 번 감싸서 던지므로, 원인(cause)을 따라가며 오류 코드를 찾는다.
export function pgErrorCode(error: unknown): string | undefined {
  let current = error;
  for (let depth = 0; depth < 5 && current instanceof Error; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = current.cause;
  }
  return undefined;
}
