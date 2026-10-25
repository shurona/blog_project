// 샘플 데이터를 읽는 함수. DB를 붙이면 같은 모양의 DAL 함수로 바꾼다.
import {
  extractPlainText,
  makeSummary,
  pickCoverImageKey,
} from "@/features/posts/content";
import type { PostDetail, PostListItem } from "@/features/posts/types";
import type {
  Category,
  CategoryWithCount,
  ShopProfile,
} from "@/features/shops/types";
import { shopSlugSchema } from "@/features/shops/validation";
import { idParamSchema } from "@/lib/id-param";
import {
  sampleCategories,
  samplePosts,
  sampleShops,
  type SamplePost,
  type SampleShop,
} from "./data";

function toShopProfile(shop: SampleShop): ShopProfile {
  const { slug, name, type, intro, profileImageKey } = shop;
  return { slug, name, type, intro, profileImageKey };
}

function findSampleShop(slugParam: string): SampleShop | undefined {
  const slug = shopSlugSchema.safeParse(slugParam);
  if (!slug.success) return undefined;
  return sampleShops.find((shop) => shop.slug === slug.data);
}

function toListItem(post: SamplePost): PostListItem {
  const category = sampleCategories.find((c) => c.id === post.categoryId);
  return {
    id: post.id,
    title: post.title,
    categoryId: post.categoryId,
    categoryName: category?.name ?? "",
    publishedAt: post.publishedAt,
    summary: makeSummary(extractPlainText(post.content)),
    coverImageKey: pickCoverImageKey(post.content, post.chosenCoverKey),
  };
}

export async function listShops(): Promise<ShopProfile[]> {
  return sampleShops.map(toShopProfile);
}

// 주소에서 받은 상점 주소를 검사하고 찾는다. 형식이 틀리거나 없으면 null.
export async function findShop(slugParam: string): Promise<ShopProfile | null> {
  const shop = findSampleShop(slugParam);
  return shop ? toShopProfile(shop) : null;
}

export async function listCategories(
  shopSlug: string,
): Promise<CategoryWithCount[]> {
  const shop = findSampleShop(shopSlug);
  if (!shop) return [];
  return sampleCategories
    .filter((category) => category.shopId === shop.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      id: category.id,
      name: category.name,
      postCount: samplePosts.filter((p) => p.categoryId === category.id).length,
    }));
}

// 카테고리 번호를 검사하고, 그 상점의 카테고리일 때만 돌려준다.
export async function findCategory(
  shopSlug: string,
  categoryIdParam: string,
): Promise<Category | null> {
  const shop = findSampleShop(shopSlug);
  const id = idParamSchema.safeParse(categoryIdParam);
  if (!shop || !id.success) return null;
  const category = sampleCategories.find(
    (c) => c.id === id.data && c.shopId === shop.id,
  );
  return category ? { id: category.id, name: category.name } : null;
}

export async function listPosts(
  shopSlug: string,
  categoryId?: number,
): Promise<PostListItem[]> {
  const shop = findSampleShop(shopSlug);
  if (!shop) return [];
  return samplePosts
    .filter(
      (post) =>
        post.shopId === shop.id &&
        (categoryId === undefined || post.categoryId === categoryId),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(toListItem);
}

// 글 번호를 검사하고, 그 상점의 글일 때만 돌려준다. 다른 상점 주소로는 보이지 않는다.
export async function findPost(
  shopSlug: string,
  postIdParam: string,
): Promise<PostDetail | null> {
  const shop = findSampleShop(shopSlug);
  const id = idParamSchema.safeParse(postIdParam);
  if (!shop || !id.success) return null;
  const post = samplePosts.find(
    (p) => p.id === id.data && p.shopId === shop.id,
  );
  return post ? { ...toListItem(post), content: post.content } : null;
}
