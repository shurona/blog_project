import type { z } from "zod";

// 서버 액션이 폼에 돌려주는 결과. 입력 오류처럼 예상할 수 있는 실패는 ok: false로 돌려주고,
// 예상하지 못한 오류는 던져서 오류 화면으로 보낸다.
export type ActionResult =
  | { ok: true; message?: string }
  | {
      ok: false;
      error: string;
      // 칸별 오류 메시지
      fieldErrors?: Record<string, string>;
      // 다시 보여줄 입력값. 폼이 제출 후 초기화돼도 입력한 내용이 남게 한다.
      values?: Record<string, string>;
    };

// zod 검사 실패를 칸별 첫 번째 오류 메시지로 바꾼다.
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in fieldErrors)) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

// 폼 입력값 중 글자인 것만 모은다.
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}
