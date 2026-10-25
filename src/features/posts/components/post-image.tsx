// 사진 key를 받아 화면에 보여준다. R2를 연결하기 전이라 지금은 회색 자리 표시만 그린다.
export function PostImage({
  imageKey,
  alt,
  className = "",
}: {
  imageKey: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      data-image-key={imageKey}
      className={`flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 p-2 text-center text-xs text-gray-500 ${className}`}
    >
      {alt}
    </div>
  );
}
