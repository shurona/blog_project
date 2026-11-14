// 권한 판단. DB 없이 테스트할 수 있게, DAL이 조회한 값만 받아서 판단한다.
// 로그인하지 않았으면 admin은 null이다.
export type AdminPrincipal = {
  isSuperAdmin: boolean;
  // 이 관리자가 맡은 상점 번호
  shopIds: readonly number[];
};

// 상점의 글·카테고리·휴지통·상점 정보 관리. 전체 관리자는 모든 상점, 상점 관리자는 맡은 상점만.
export function canManageShop(
  admin: AdminPrincipal | null,
  shopId: number,
): boolean {
  if (!admin) return false;
  return admin.isSuperAdmin || admin.shopIds.includes(shopId);
}

// 상점 만들기, 관리자 계정 만들기와 권한 주기. 전체 관리자만.
export function canManageSite(admin: AdminPrincipal | null): boolean {
  return admin?.isSuperAdmin ?? false;
}
