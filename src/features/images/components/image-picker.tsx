"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { UploadedImage } from "../dto";
import { uploadImage } from "../upload-image";
import { fitWithin, SOURCE_TYPES, THUMB_MAX_SIDE } from "../validation";

// 사진 한 장을 고르는 칸. 고르면 바로 올리고, 올린 사진 번호를 폼 값(name)으로 넣는다.
// 폼을 저장해야 반영된다.
export function ImagePicker({
  shopSlug,
  name,
  label,
  hint,
  initialImage,
  error,
}: {
  shopSlug: string;
  name: string;
  label: string;
  hint?: string;
  initialImage: UploadedImage | null;
  // 폼을 저장할 때 서버가 돌려준 오류
  error?: string;
}) {
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 반응하게 비워 둔다.
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadImage(shopSlug, file);
      if (result.ok) setImage(result.image);
      else setUploadError(result.error);
    } catch {
      setUploadError("사진을 올리지 못했어요. 잠시 뒤에 다시 해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const preview = image
    ? fitWithin(image.width, image.height, THUMB_MAX_SIDE)
    : null;
  const message = uploadError ?? error;
  const buttonClass =
    "rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50";

  return (
    <div className="text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input type="hidden" name={name} value={image?.id ?? ""} />
      <input
        ref={fileInput}
        type="file"
        accept={SOURCE_TYPES.join(",")}
        onChange={onFileChange}
        className="hidden"
        aria-label={`${label} 파일`}
      />
      <div className="mt-2 flex flex-wrap items-end gap-3">
        {image && preview ? (
          <Image
            src={image.thumbUrl}
            width={preview.width}
            height={preview.height}
            alt={`${label} 미리보기`}
            className="h-32 w-auto rounded border border-gray-200 object-contain"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
            사진 없음
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className={buttonClass}
          >
            {uploading ? "올리는 중…" : image ? "사진 바꾸기" : "사진 고르기"}
          </button>
          {image && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setUploadError(null);
                setImage(null);
              }}
              className={buttonClass}
            >
              사진 빼기
            </button>
          )}
        </div>
      </div>
      {hint && <span className="mt-2 block text-xs text-gray-500">{hint}</span>}
      {message && (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {message}
        </span>
      )}
    </div>
  );
}
