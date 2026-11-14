import { describe, expect, it } from "vitest";

import {
  buildCategoryTree,
  hasPosts,
  moveInOrder,
  type CategoryRow,
} from "./tree";

const row = (
  id: number,
  parentId: number | null,
  name: string,
  counts: Partial<CategoryRow> = {},
): CategoryRow => ({
  id,
  parentId,
  name,
  postCount: 0,
  trashedPostCount: 0,
  ...counts,
});

describe("buildCategoryTree", () => {
  it("하위 카테고리를 상위 카테고리 아래에 묶는다", () => {
    const tree = buildCategoryTree([
      row(1, null, "A브랜드"),
      row(2, null, "B브랜드"),
      row(3, 1, "제주"),
      row(4, 2, "부산"),
      row(5, 1, "설악"),
    ]);
    expect(tree.map((node) => node.name)).toEqual(["A브랜드", "B브랜드"]);
    expect(tree[0].children.map((child) => child.name)).toEqual([
      "제주",
      "설악",
    ]);
    expect(tree[1].children.map((child) => child.name)).toEqual(["부산"]);
  });

  it("받은 순서를 그대로 지킨다", () => {
    const tree = buildCategoryTree([
      row(9, null, "나중에 만든 것"),
      row(1, null, "먼저 만든 것"),
    ]);
    expect(tree.map((node) => node.id)).toEqual([9, 1]);
  });

  it("하위 카테고리가 상위보다 먼저 와도 묶는다", () => {
    const tree = buildCategoryTree([row(3, 1, "제주"), row(1, null, "A")]);
    expect(tree[0].children.map((child) => child.id)).toEqual([3]);
  });

  it("카테고리가 없으면 빈 목록이다", () => {
    expect(buildCategoryTree([])).toEqual([]);
  });
});

describe("hasPosts", () => {
  it("글이 없으면 false", () => {
    expect(hasPosts(row(1, null, "A"))).toBe(false);
  });

  it("휴지통에만 글이 있어도 true", () => {
    expect(hasPosts(row(1, null, "A", { trashedPostCount: 1 }))).toBe(true);
  });

  it("글이 있으면 true", () => {
    expect(hasPosts(row(1, null, "A", { postCount: 2 }))).toBe(true);
  });
});

describe("moveInOrder", () => {
  it("한 칸 위로 옮긴다", () => {
    expect(moveInOrder([1, 2, 3], 3, "up")).toEqual([1, 3, 2]);
  });

  it("한 칸 아래로 옮긴다", () => {
    expect(moveInOrder([1, 2, 3], 1, "down")).toEqual([2, 1, 3]);
  });

  it.each([
    ["맨 위에서 위로", 1, "up"],
    ["맨 아래에서 아래로", 3, "down"],
    ["목록에 없는 번호", 9, "up"],
  ] as const)("옮길 수 없으면 null(%s)", (_, id, direction) => {
    expect(moveInOrder([1, 2, 3], id, direction)).toBeNull();
  });

  it("원래 목록은 바꾸지 않는다", () => {
    const ids = [1, 2, 3];
    moveInOrder(ids, 2, "up");
    expect(ids).toEqual([1, 2, 3]);
  });
});
