import { z } from "zod";

import { idParamSchema } from "@/lib/id-param";

import { SHOP_TYPES } from "./shop-types";

// 상점 주소는 주소 맨 앞(/상점주소)에 오기 때문에, 앱이 쓰거나 나중에 쓸 수 있는 경로와 겹치는 단어는 막는다.
// "new"는 관리 화면의 상점 만들기 주소(/admin/shops/new)와 겹친다.
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
  "new",
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

// 오류 메시지는 해당 칸 바로 아래에 보여주므로 칸 이름을 넣지 않는다.
// (칸 이름을 넣으면 "링크은(는)"처럼 조사가 어색해진다)

// 비워 둘 수 있는 글자 칸. 앞뒤 공백을 지우고, 비어 있으면 null로 저장한다.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max.toLocaleString("ko-KR")}자까지 쓸 수 있어요.`)
    .transform((value) => value || null);

// 비워 둘 수 있는 링크 칸. `javascript:` 같은 위험한 주소를 막으려고 http/https만 받는다.
const optionalLink = z
  .string()
  .trim()
  .max(500, "링크가 너무 길어요. 500자까지 쓸 수 있어요.")
  .refine(
    (value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value),
    "http:// 또는 https://로 시작하는 주소를 넣어 주세요.",
  )
  .transform((value) => value || null);

// 상점 정보 칸. 상점 주소(slug)는 만들 때만 정하므로 여기에는 없다.
export const shopFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "상점 이름을 입력해 주세요.")
    .max(50, "상점 이름은 50자 이하여야 해요."),
  type: z.enum(SHOP_TYPES, "상점 종류를 골라 주세요."),
  intro: optionalText(200),
  description: optionalText(5000),
  address: optionalText(200),
  businessHours: optionalText(500),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[0-9+\-() ]{7,20}$/.test(value),
      "전화번호는 숫자와 하이픈(-)으로 입력해 주세요.",
    )
    .transform((value) => value || null),
  kakaoChannelUrl: optionalLink,
  instagramUrl: optionalLink,
  naverMapUrl: optionalLink,
  kakaoMapUrl: optionalLink,
  // 대표 사진으로 고른 사진 번호. 비어 있으면 대표 사진이 없다.
  profileImageId: z
    .union([z.literal(""), idParamSchema], "사진을 다시 골라 주세요.")
    .transform((id) => (id === "" ? null : id)),
});

// 대표 사진은 상점 번호가 있어야 올릴 수 있어서, 상점을 만든 뒤에 넣는다.
export const shopCreateSchema = shopFieldsSchema
  .omit({ profileImageId: true })
  .extend({ slug: shopSlugSchema });

export type ShopFields = z.output<typeof shopFieldsSchema>;
