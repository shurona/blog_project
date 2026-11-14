"use client";

import { useActionState } from "react";

import type { ActionResult } from "@/lib/action-result";

import type { ShopSettings } from "../dal";
import { SHOP_TYPE_LABELS, SHOP_TYPES } from "../shop-types";

type ShopAction = (
  previous: ActionResult | null,
  formData: FormData,
) => Promise<ActionResult>;

// 상점 만들기와 수정에 같이 쓴다. shop이 있으면 수정이고, 상점 주소는 바꿀 수 없다.
export function ShopForm({
  action,
  shop,
}: {
  action: ShopAction;
  shop?: ShopSettings;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const failed = state && !state.ok ? state : null;

  // 제출에 실패하면 입력한 값을, 처음에는 저장된 값을 보여준다.
  const value = (name: keyof ShopSettings) =>
    failed?.values?.[name] ?? String(shop?.[name] ?? "");
  const fieldProps = (name: keyof ShopSettings) => ({
    name,
    defaultValue: value(name),
    error: failed?.fieldErrors?.[name],
  });

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <Section title="기본 정보">
        {shop ? (
          <div className="text-sm">
            <span className="font-medium text-gray-700">상점 주소</span>
            <p className="mt-1 text-gray-900">/{shop.slug}</p>
            <p className="mt-1 text-xs text-gray-500">
              상점 주소는 만든 뒤에 바꿀 수 없어요.
            </p>
          </div>
        ) : (
          <Field
            label="상점 주소"
            hint="영문 소문자, 숫자, 하이픈(-)으로 3~30자예요. 만든 뒤에는 바꿀 수 없어요. 예: solbaram-condo"
            {...fieldProps("slug")}
          />
        )}
        <Field label="상점 이름" {...fieldProps("name")} />
        <label className="block text-sm">
          <span className="font-medium text-gray-700">종류</span>
          <select
            name="type"
            defaultValue={value("type") || SHOP_TYPES[0]}
            className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2"
          >
            {SHOP_TYPES.map((type) => (
              <option key={type} value={type}>
                {SHOP_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <FieldError message={failed?.fieldErrors?.type} />
        </label>
      </Section>

      <Section title="소개">
        <Field
          label="짧은 소개"
          hint="블로그 사이드바에 보여요. 200자까지예요."
          rows={2}
          {...fieldProps("intro")}
        />
        <Field
          label="소개글"
          hint="상점 소개 페이지에 보여요."
          rows={6}
          {...fieldProps("description")}
        />
      </Section>

      <Section title="연락처와 위치">
        <Field label="주소" {...fieldProps("address")} />
        <Field
          label="영업시간"
          hint="자유롭게 써 주세요. 예: 매일 09:00~18:00, 월요일 휴무"
          rows={3}
          {...fieldProps("businessHours")}
        />
        <Field label="전화번호" {...fieldProps("phone")} />
        <Field
          label="카카오톡 채널 링크"
          placeholder="https://pf.kakao.com/..."
          {...fieldProps("kakaoChannelUrl")}
        />
        <Field
          label="인스타그램 링크"
          placeholder="https://www.instagram.com/..."
          {...fieldProps("instagramUrl")}
        />
        <Field
          label="네이버 지도 링크"
          hint="비워 두면 주소로 검색하는 링크를 만들어요."
          {...fieldProps("naverMapUrl")}
        />
        <Field
          label="카카오맵 링크"
          hint="비워 두면 주소로 검색하는 링크를 만들어요."
          {...fieldProps("kakaoMapUrl")}
        />
      </Section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장하는 중…" : shop ? "저장" : "상점 만들기"}
        </button>
        {failed && (
          <p role="alert" className="text-sm text-red-600">
            {failed.error}
          </p>
        )}
        {state?.ok && state.message && (
          <p role="status" className="text-sm text-green-700">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <legend className="px-1 text-sm font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  hint,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
}) {
  const className =
    "mt-1 block w-full rounded border border-gray-300 px-3 py-2 aria-invalid:border-red-500";
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      {rows ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={className}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={className}
        />
      )}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-600">{message}</span>;
}
