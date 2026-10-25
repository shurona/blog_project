import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { extractPlainText, makeSummary, pickCoverImageKey } from "./content";

const text = (value: string): JSONContent => ({ type: "text", text: value });
const image = (key: string): JSONContent => ({
  type: "image",
  attrs: { src: key, alt: "" },
});

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [text("가을 패키지")] },
    {
      type: "paragraph",
      content: [
        text("오션뷰 "),
        { type: "text", text: "객실", marks: [{ type: "bold" }] },
        text("이에요."),
      ],
    },
    image("a.webp"),
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [text("조식")] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [text("주차")] }],
        },
      ],
    },
    image("b.webp"),
  ],
};

describe("extractPlainText", () => {
  it("문단·제목·목록의 글자를 공백 하나로 잇고, 굵은 글씨도 이어 붙인다", () => {
    expect(extractPlainText(doc)).toBe(
      "가을 패키지 오션뷰 객실이에요. 조식 주차",
    );
  });

  it("글자가 없으면 빈 문자열을 돌려준다", () => {
    expect(extractPlainText({ type: "doc", content: [image("a.webp")] })).toBe(
      "",
    );
  });
});

describe("makeSummary", () => {
  it("짧은 글은 그대로 둔다", () => {
    expect(makeSummary("짧은 글", 10)).toBe("짧은 글");
  });

  it("긴 글은 자르고 말줄임표를 붙인다", () => {
    expect(makeSummary("가나다라마바사", 3)).toBe("가나다…");
  });

  it("자른 끝의 공백은 지운다", () => {
    expect(makeSummary("가나 다라", 3)).toBe("가나…");
  });

  it("이모지도 한 글자로 센다", () => {
    expect(makeSummary("😀😀😀😀", 2)).toBe("😀😀…");
  });
});

describe("pickCoverImageKey", () => {
  it("고른 사진이 본문에 있으면 그 사진을 쓴다", () => {
    expect(pickCoverImageKey(doc, "b.webp")).toBe("b.webp");
  });

  it("고른 사진이 없으면 본문의 첫 사진을 쓴다", () => {
    expect(pickCoverImageKey(doc, null)).toBe("a.webp");
  });

  it("고른 사진이 본문에서 지워졌으면 첫 사진을 쓴다", () => {
    expect(pickCoverImageKey(doc, "deleted.webp")).toBe("a.webp");
  });

  it("본문에 사진이 없으면 null", () => {
    expect(pickCoverImageKey({ type: "doc", content: [] }, null)).toBeNull();
  });
});
