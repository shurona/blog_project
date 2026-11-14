"use client";

import { useActionState, useState, useTransition } from "react";

import type { ActionResult } from "@/lib/action-result";

import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  renameCategoryAction,
} from "../actions";
import { hasPosts, type CategoryItem, type CategoryNode } from "../tree";
import { CATEGORY_NAME_MAX, type MoveDirection } from "../validation";

// 이름 바꾸기나 하위 카테고리 추가 칸은 한 번에 하나만 연다.
type OpenForm = { kind: "rename" | "addChild"; id: number };

const HAS_POSTS_NOTICE =
  "이 카테고리에 글이 있어요(휴지통의 글 포함). 글을 다른 카테고리로 옮긴 뒤 하위 카테고리를 만들어 주세요.";

export function CategoryManager({
  slug,
  categories,
}: {
  slug: string;
  categories: CategoryNode[];
}) {
  const [openForm, setOpenForm] = useState<OpenForm | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 순서 바꾸기와 지우기는 버튼 하나로 끝나는 일이라, 실패하면 목록 위에 메시지를 보여준다.
  const run = (action: () => Promise<ActionResult>) => {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setNotice(result.error);
    });
  };

  const toggle = (form: OpenForm) => {
    setNotice(null);
    setOpenForm((current) =>
      current?.kind === form.kind && current.id === form.id ? null : form,
    );
  };

  const rowProps = (
    category: CategoryItem,
    index: number,
    siblingCount: number,
  ) => ({
    category,
    isFirst: index === 0,
    isLast: index === siblingCount - 1,
    busy: pending,
    renaming: openForm?.kind === "rename" && openForm.id === category.id,
    onMove: (direction: MoveDirection) =>
      run(() => moveCategoryAction(slug, category.id, direction)),
    onRename: () => toggle({ kind: "rename", id: category.id }),
    onDelete: () => {
      if (window.confirm(`"${category.name}" 카테고리를 지울까요?`)) {
        run(() => deleteCategoryAction(slug, category.id));
      }
    },
    renameAction: (formData: FormData) =>
      renameCategoryAction(slug, category.id, formData),
    onClose: () => setOpenForm(null),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold">카테고리 추가</h2>
        <div className="mt-3">
          <NameForm
            label="새 카테고리 이름"
            submitLabel="추가"
            action={(formData) => createCategoryAction(slug, formData)}
          />
        </div>
      </section>

      {notice && (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {notice}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-12 text-center text-sm text-gray-500">
          아직 카테고리가 없어요. 글을 쓰려면 카테고리를 먼저 만들어 주세요.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {categories.map((category, index) => (
            <li key={category.id}>
              <CategoryRow
                {...rowProps(category, index, categories.length)}
                canDelete={
                  category.children.length === 0 && !hasPosts(category)
                }
                onAddChild={() => {
                  // 글이 있는 카테고리에는 하위 카테고리를 만들 수 없다. 서버에서도 다시 막는다.
                  if (hasPosts(category)) {
                    setOpenForm(null);
                    setNotice(HAS_POSTS_NOTICE);
                  } else {
                    toggle({ kind: "addChild", id: category.id });
                  }
                }}
              />
              {(category.children.length > 0 ||
                (openForm?.kind === "addChild" &&
                  openForm.id === category.id)) && (
                <ul className="border-t border-gray-100 bg-gray-50">
                  {category.children.map((child, childIndex) => (
                    <li
                      key={child.id}
                      className="border-b border-gray-100 pl-6 last:border-b-0"
                    >
                      <CategoryRow
                        {...rowProps(
                          child,
                          childIndex,
                          category.children.length,
                        )}
                        canDelete={!hasPosts(child)}
                      />
                    </li>
                  ))}
                  {openForm?.kind === "addChild" &&
                    openForm.id === category.id && (
                      <li className="py-3 pr-5 pl-11">
                        <NameForm
                          label={`${category.name}의 하위 카테고리 이름`}
                          submitLabel="추가"
                          parentId={category.id}
                          autoFocus
                          action={(formData) =>
                            createCategoryAction(slug, formData)
                          }
                          onCancel={() => setOpenForm(null)}
                        />
                      </li>
                    )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <ul className="list-disc space-y-1 pl-5 text-xs text-gray-500">
        <li>카테고리는 상위·하위 2단계까지 만들 수 있어요.</li>
        <li>
          하위 카테고리가 있는 카테고리에는 글을 바로 넣지 않고, 하위 카테고리에
          넣어요.
        </li>
        <li>
          글(휴지통 포함)이나 하위 카테고리가 있는 카테고리는 지울 수 없어요.
        </li>
      </ul>
    </div>
  );
}

function CategoryRow({
  category,
  isFirst,
  isLast,
  busy,
  renaming,
  canDelete,
  onMove,
  onRename,
  onAddChild,
  onDelete,
  renameAction,
  onClose,
}: {
  category: CategoryItem;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  renaming: boolean;
  canDelete: boolean;
  onMove: (direction: MoveDirection) => void;
  onRename: () => void;
  // 하위 카테고리에는 없다(2단계까지만 만든다).
  onAddChild?: () => void;
  onDelete: () => void;
  renameAction: (formData: FormData) => Promise<ActionResult>;
  onClose: () => void;
}) {
  if (renaming) {
    return (
      <div className="px-5 py-3">
        <NameForm
          label={`${category.name}의 새 이름`}
          submitLabel="저장"
          initialName={category.name}
          autoFocus
          action={renameAction}
          onDone={onClose}
          onCancel={onClose}
        />
      </div>
    );
  }

  const buttonClass =
    "rounded px-2 py-1 text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3">
      <p className="min-w-0 text-sm">
        <span className="font-medium break-words">{category.name}</span>
        <span className="ml-2 text-xs text-gray-500">
          글 {category.postCount}개
          {category.trashedPostCount > 0 &&
            ` · 휴지통 ${category.trashedPostCount}개`}
        </span>
      </p>
      <div className="flex items-center gap-1 text-xs">
        <button
          type="button"
          disabled={busy || isFirst}
          onClick={() => onMove("up")}
          aria-label={`${category.name} 위로`}
          className={buttonClass}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={busy || isLast}
          onClick={() => onMove("down")}
          aria-label={`${category.name} 아래로`}
          className={buttonClass}
        >
          ↓
        </button>
        <button type="button" onClick={onRename} className={buttonClass}>
          이름 바꾸기
        </button>
        {onAddChild && (
          <button type="button" onClick={onAddChild} className={buttonClass}>
            하위 추가
          </button>
        )}
        <button
          type="button"
          disabled={busy || !canDelete}
          onClick={onDelete}
          title={
            canDelete
              ? undefined
              : "글이나 하위 카테고리가 있으면 지울 수 없어요."
          }
          className={`${buttonClass} enabled:text-red-600`}
        >
          지우기
        </button>
      </div>
    </div>
  );
}

// 카테고리 이름 한 칸짜리 폼. 만들기와 이름 바꾸기에 같이 쓴다.
function NameForm({
  label,
  submitLabel,
  initialName = "",
  parentId,
  autoFocus,
  action,
  onDone,
  onCancel,
}: {
  label: string;
  submitLabel: string;
  initialName?: string;
  parentId?: number;
  autoFocus?: boolean;
  action: (formData: FormData) => Promise<ActionResult>;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_previous: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.ok) onDone?.();
      return result;
    },
    null,
  );
  const failed = state && !state.ok ? state : null;
  const message = failed ? (failed.fieldErrors?.name ?? failed.error) : null;

  return (
    <form action={formAction}>
      {parentId !== undefined && (
        <input type="hidden" name="parentId" value={parentId} />
      )}
      <div className="flex items-center gap-2">
        <input
          name="name"
          aria-label={label}
          placeholder={`${CATEGORY_NAME_MAX}자까지`}
          // 제출에 실패하면 입력한 값을 다시 보여준다.
          defaultValue={failed?.values?.name ?? initialName}
          autoFocus={autoFocus}
          aria-invalid={message ? true : undefined}
          className="block min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm aria-invalid:border-red-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장하는 중…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            취소
          </button>
        )}
      </div>
      {message && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {message}
        </p>
      )}
    </form>
  );
}
