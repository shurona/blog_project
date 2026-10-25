import { z } from "zod";

// 상점 주소는 주소 맨 앞(/상점주소)에 오기 때문에, 앱이 쓰거나 나중에 쓸 수 있는 경로와 겹치는 단어는 막는다.
export const RESERVED_SHOP_SLUGS = [
  "about",
  "account",
  "admin",
  "api",
  "assets",
  "auth",
  "help",
  "images",
  "login",
  "logout",
  "posts",
  "search",
  "settings",
  "shops",
  "signup",
  "static",
  "uploads",
] as const;

const reserved: ReadonlySet<string> = new Set(RESERVED_SHOP_SLUGS);

export const shopSlugSchema = z
  .string()
  .min(3, "상점 주소는 3자 이상이어야 해요.")
  .max(30, "상점 주소는 30자 이하여야 해요.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "상점 주소는 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.",
  )
  .refine((slug) => !reserved.has(slug), "사용할 수 없는 상점 주소예요.");
