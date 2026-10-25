export const SHOP_TYPES = ["condo", "pension", "golf"] as const;

export type ShopType = (typeof SHOP_TYPES)[number];

export const SHOP_TYPE_LABELS: Record<ShopType, string> = {
  condo: "콘도",
  pension: "펜션",
  golf: "골프",
};
