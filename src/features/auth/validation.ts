import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./password-policy";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "지금 비밀번호를 입력해 주세요."),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `새 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 해요.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `새 비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 해요.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호와 확인이 서로 달라요.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "새 비밀번호는 지금 비밀번호와 달라야 해요.",
    path: ["newPassword"],
  });
