const koreanDateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// DB에 UTC로 저장한 시각을 한국 날짜로 보여준다. 예: "2026. 10. 20."
export function formatKoreanDate(isoDateTime: string): string {
  return koreanDateFormat.format(new Date(isoDateTime));
}
