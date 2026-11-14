import type { MoveDirection } from "./validation";

// DB에서 읽은 카테고리 한 줄. 순서대로 정렬되어 있다고 본다.
export type CategoryRow = {
  id: number;
  parentId: number | null;
  name: string;
  // 휴지통에 없는 글 수
  postCount: number;
  // 휴지통에 있는 글 수. 이 글들 때문에도 카테고리를 지울 수 없다.
  trashedPostCount: number;
};

export type CategoryItem = Omit<CategoryRow, "parentId">;

// 관리 화면에 보여주는 위 단계 카테고리와 그 아래 카테고리
export type CategoryNode = CategoryItem & { children: CategoryItem[] };

// 한 줄로 읽은 카테고리를 2단계 나무 모양으로 묶는다. 받은 순서를 그대로 지킨다.
export function buildCategoryTree(
  rows: readonly CategoryRow[],
): CategoryNode[] {
  const nodes = new Map<number, CategoryNode>();
  for (const { parentId, ...item } of rows) {
    if (parentId === null) nodes.set(item.id, { ...item, children: [] });
  }
  for (const { parentId, ...item } of rows) {
    if (parentId !== null) nodes.get(parentId)?.children.push(item);
  }
  return [...nodes.values()];
}

// 글이 하나라도 있으면(휴지통 포함) 하위 카테고리를 만들 수 없고 지울 수도 없다.
export function hasPosts(category: CategoryItem): boolean {
  return category.postCount + category.trashedPostCount > 0;
}

// 같은 단계의 카테고리 번호 목록에서 하나를 한 칸 위나 아래로 옮긴 새 순서를 돌려준다.
// 맨 위에서 위로, 맨 아래에서 아래로처럼 옮길 수 없으면 null이다.
export function moveInOrder(
  ids: readonly number[],
  id: number,
  direction: MoveDirection,
): number[] | null {
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return null;
  const moved = [...ids];
  [moved[from], moved[to]] = [moved[to], moved[from]];
  return moved;
}
