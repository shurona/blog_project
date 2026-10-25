import type { JSONContent } from "@tiptap/core";

// 본문 JSON에서 글자만 뽑는다. 문단·제목·목록 사이는 공백 하나로 잇는다.
export function extractPlainText(doc: JSONContent): string {
  const parts: string[] = [];
  const collect = (node: JSONContent) => {
    if (node.type === "text") {
      parts.push(node.text ?? "");
      return;
    }
    node.content?.forEach(collect);
    parts.push(" ");
  };
  collect(doc);
  return parts.join("").replace(/\s+/g, " ").trim();
}

// 목록과 공유 미리보기에 쓰는 요약. 글자 수는 이모지도 한 글자로 센다.
export function makeSummary(text: string, maxLength = 120): string {
  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;
  return `${chars.slice(0, maxLength).join("").trimEnd()}…`;
}

function collectImageKeys(node: JSONContent, keys: string[] = []): string[] {
  if (node.type === "image" && typeof node.attrs?.src === "string") {
    keys.push(node.attrs.src);
  }
  node.content?.forEach((child) => collectImageKeys(child, keys));
  return keys;
}

// 대표 사진: 직접 고른 사진이 본문에 있으면 그 사진, 아니면 본문의 첫 사진.
export function pickCoverImageKey(
  doc: JSONContent,
  chosenKey: string | null,
): string | null {
  const keys = collectImageKeys(doc);
  if (chosenKey && keys.includes(chosenKey)) return chosenKey;
  return keys[0] ?? null;
}
