// drizzle-kit이 이 파일을 직접 읽기 때문에 '@/' 별칭 대신 상대 경로로 가져온다.
import type { JSONContent } from "@tiptap/core";
import {
  type AnyPgColumn,
  type PgTableExtraConfigValue,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { POST_STATUSES } from "../../../features/posts/post-status";
import { SHOP_TYPES } from "../../../features/shops/shop-types";
import { user } from "./auth";

// 상점·글·사진 테이블이 서로를 참조해서, TypeScript가 타입을 추론할 수 있게
// 참조 함수와 제약 조건 목록에 타입(AnyPgColumn, PgTableExtraConfigValue[])을 직접 적는다.

// 시각은 모두 UTC 기준(timestamptz)으로 저장한다.
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

export const shopType = pgEnum("shop_type", SHOP_TYPES);
export const postStatus = pgEnum("post_status", POST_STATUSES);

export const shops = pgTable(
  "shops",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: shopType("type").notNull(),
    intro: text("intro"), // 사이드바의 짧은 소개
    description: text("description"), // 소개 페이지의 소개글
    profileImageId: integer("profile_image_id"),
    address: text("address"),
    businessHours: text("business_hours"),
    phone: text("phone"),
    kakaoChannelUrl: text("kakao_channel_url"),
    instagramUrl: text("instagram_url"),
    // 비워 두면 주소로 검색하는 지도 링크를 만든다.
    naverMapUrl: text("naver_map_url"),
    kakaoMapUrl: text("kakao_map_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t): PgTableExtraConfigValue[] => [
    // 대표 사진은 이 상점이 올린 사진이어야 한다.
    foreignKey({
      name: "shops_profile_image_fk",
      columns: [t.profileImageId, t.id],
      foreignColumns: [images.id, images.shopId],
    }),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    shopId: integer("shop_id")
      .notNull()
      .references((): AnyPgColumn => shops.id),
    // 비어 있으면 위 단계 카테고리다. 2단계까지만 만들 수 있게 DAL에서 검사한다.
    parentId: integer("parent_id"),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t): PgTableExtraConfigValue[] => [
    unique("categories_id_shop_id_unique").on(t.id, t.shopId),
    // 상위 카테고리는 같은 상점의 카테고리여야 한다. 하위 카테고리가 있으면 지울 수 없다.
    foreignKey({
      name: "categories_parent_fk",
      columns: [t.parentId, t.shopId],
      foreignColumns: [t.id, t.shopId],
    }),
    // 같은 단계 안에서는 이름이 겹치지 않게 한다.
    unique("categories_shop_parent_name_unique")
      .on(t.shopId, t.parentId, t.name)
      .nullsNotDistinct(),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    shopId: integer("shop_id")
      .notNull()
      .references((): AnyPgColumn => shops.id),
    categoryId: integer("category_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    title: text("title").notNull(),
    content: jsonb("content").$type<JSONContent>().notNull(),
    // 본문에서 뽑은 글자. 검색과 자동 요약에 쓴다.
    plainText: text("plain_text").notNull(),
    // 직접 입력한 요약. 비어 있으면 plainText 앞 120자를 쓴다.
    customSummary: text("custom_summary"),
    // 직접 고른 대표 사진. 비어 있으면 본문의 첫 사진을 쓴다.
    coverImageId: integer("cover_image_id"),
    status: postStatus("status").notNull().default("draft"),
    viewCount: integer("view_count").notNull().default(0),
    // 처음 공개한 시각. 목록을 이 순서로 정렬한다.
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // 휴지통. 값이 있으면 지운 글이고, 비우면 복구된다.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t): PgTableExtraConfigValue[] => [
    unique("posts_id_shop_id_unique").on(t.id, t.shopId),
    // 카테고리와 대표 사진은 같은 상점의 것이어야 한다. 글이 있는 카테고리는 지울 수 없다.
    foreignKey({
      name: "posts_category_fk",
      columns: [t.categoryId, t.shopId],
      foreignColumns: [categories.id, categories.shopId],
    }),
    foreignKey({
      name: "posts_cover_image_fk",
      columns: [t.coverImageId, t.shopId],
      foreignColumns: [images.id, images.shopId],
    }),
    index("posts_shop_list_idx").on(t.shopId, t.status, t.publishedAt),
    index("posts_category_list_idx").on(t.categoryId, t.status, t.publishedAt),
  ],
);

export const images = pgTable(
  "images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    shopId: integer("shop_id")
      .notNull()
      .references((): AnyPgColumn => shops.id),
    // 사진이 쓰인 글. 어디에도 쓰이지 않는 사진은 나중에 정리한다.
    postId: integer("post_id"),
    // R2 key. 본문용(긴 변 1920px)과 목록용(640px)
    key: text("key").notNull().unique(),
    thumbKey: text("thumb_key").notNull().unique(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    contentType: text("content_type").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
  },
  (t): PgTableExtraConfigValue[] => [
    unique("images_id_shop_id_unique").on(t.id, t.shopId),
    // 사진이 쓰인 글은 같은 상점의 글이어야 한다.
    foreignKey({
      name: "images_post_fk",
      columns: [t.postId, t.shopId],
      foreignColumns: [posts.id, posts.shopId],
    }),
    index("images_post_id_idx").on(t.postId),
  ],
);

// 상점 관리자. 한 관리자가 여러 상점을 맡을 수 있다. 전체 관리자는 user.isSuperAdmin으로 구분한다.
export const shopMembers = pgTable(
  "shop_members",
  {
    shopId: integer("shop_id")
      .notNull()
      .references((): AnyPgColumn => shops.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t): PgTableExtraConfigValue[] => [
    primaryKey({ columns: [t.shopId, t.userId] }),
    index("shop_members_user_id_idx").on(t.userId),
  ],
);
