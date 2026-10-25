import type { ShopType } from "./shop-types";

// 화면에 넘기는 상점 정보. DB를 붙인 뒤에도 DAL이 같은 모양으로 돌려준다.
export type ShopProfile = {
  slug: string;
  name: string;
  type: ShopType;
  intro: string;
  profileImageKey: string | null;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoryWithCount = Category & {
  postCount: number;
};
