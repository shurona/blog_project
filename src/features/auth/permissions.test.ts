import { describe, expect, it } from "vitest";

import {
  canManageShop,
  canManageSite,
  type AdminPrincipal,
} from "./permissions";

const superAdmin: AdminPrincipal = { isSuperAdmin: true, shopIds: [] };
const shopAdmin: AdminPrincipal = { isSuperAdmin: false, shopIds: [1, 2] };
const otherShopAdmin: AdminPrincipal = { isSuperAdmin: false, shopIds: [3] };

describe("canManageShop", () => {
  it("전체 관리자는 맡지 않은 상점도 관리할 수 있다", () => {
    expect(canManageShop(superAdmin, 1)).toBe(true);
    expect(canManageShop(superAdmin, 99)).toBe(true);
  });

  it("상점 관리자는 맡은 상점만 관리할 수 있다", () => {
    expect(canManageShop(shopAdmin, 1)).toBe(true);
    expect(canManageShop(shopAdmin, 2)).toBe(true);
  });

  it("다른 상점 관리자는 관리할 수 없다", () => {
    expect(canManageShop(otherShopAdmin, 1)).toBe(false);
  });

  it("로그인하지 않으면 관리할 수 없다", () => {
    expect(canManageShop(null, 1)).toBe(false);
  });
});

describe("canManageSite", () => {
  it("전체 관리자만 상점과 관리자 계정을 관리할 수 있다", () => {
    expect(canManageSite(superAdmin)).toBe(true);
    expect(canManageSite(shopAdmin)).toBe(false);
    expect(canManageSite(null)).toBe(false);
  });
});
