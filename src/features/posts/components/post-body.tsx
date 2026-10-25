import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { PostImage } from "./post-image";

// 저장한 본문을 그대로 그리려면 에디터와 같은 확장 목록을 써야 한다. 에디터를 만들 때 이 목록을 같이 쓴다.
const extensions = [StarterKit, Image];

export function PostBody({ content }: { content: JSONContent }) {
  return (
    <div className="post-body">
      {renderToReactElement({
        content,
        extensions,
        options: {
          nodeMapping: {
            image: ({ node }) => (
              <PostImage
                imageKey={String(node.attrs.src)}
                alt={String(node.attrs.alt ?? "")}
                className="my-6 aspect-[4/3] w-full rounded"
              />
            ),
          },
          // 확장 목록에 없는 요소는 그리지 않는다.
          unhandledNode: () => null,
          unhandledMark: ({ children }) => children,
        },
      })}
    </div>
  );
}
