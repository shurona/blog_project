// 상점 데이터 캐시 태그. 공개 화면의 조회 함수가 cacheTag로 붙이고, 쓰기가 끝나면 updateTag로 갱신한다.
export const SHOPS_TAG = "shops";

export function shopTag(slug: string): string {
  return `shop:${slug}`;
}
