// 샘플 화면용 가짜 데이터. 상점·글 이름은 모두 지어낸 것이다. DB를 붙이면 이 폴더(src/sample)를 지운다.
import type { JSONContent } from "@tiptap/core";
import type { ShopProfile } from "@/features/shops/types";

export type SampleShop = ShopProfile & { id: number };

export type SampleCategory = {
  id: number;
  shopId: number;
  name: string;
  sortOrder: number;
};

export type SamplePost = {
  id: number;
  shopId: number;
  categoryId: number;
  title: string;
  publishedAt: string;
  chosenCoverKey: string | null;
  content: JSONContent;
};

const paragraph = (...content: JSONContent[]): JSONContent => ({
  type: "paragraph",
  content,
});
const text = (value: string): JSONContent => ({ type: "text", text: value });
const bold = (value: string): JSONContent => ({
  type: "text",
  text: value,
  marks: [{ type: "bold" }],
});
const heading = (value: string): JSONContent => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(value)],
});
const image = (key: string, alt: string): JSONContent => ({
  type: "image",
  attrs: { src: key, alt },
});
const bulletList = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((item) => ({
    type: "listItem",
    content: [paragraph(text(item))],
  })),
});
const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content,
});

export const sampleShops: SampleShop[] = [
  {
    id: 1,
    slug: "sample-condo",
    name: "솔바람 콘도",
    type: "condo",
    intro:
      "바다와 숲 가까이에 있는 가족 휴양 콘도예요. 제주·설악·부산 세 곳에서 운영해요.",
    profileImageKey: null,
  },
  {
    id: 2,
    slug: "sample-golf",
    name: "푸른들 골프",
    type: "golf",
    intro: "브랜드가 다른 골프장 세 곳을 함께 운영하는 골프 리조트예요.",
    profileImageKey: null,
  },
];

// 솔바람 콘도는 지역별, 푸른들 골프는 브랜드별로 카테고리를 나눴다.
export const sampleCategories: SampleCategory[] = [
  { id: 1, shopId: 1, name: "제주점", sortOrder: 1 },
  { id: 2, shopId: 1, name: "설악점", sortOrder: 2 },
  { id: 3, shopId: 1, name: "부산점", sortOrder: 3 },
  { id: 4, shopId: 2, name: "푸른들 CC", sortOrder: 1 },
  { id: 5, shopId: 2, name: "푸른들 레이크", sortOrder: 2 },
  { id: 6, shopId: 2, name: "푸른들 힐스", sortOrder: 3 },
];

export const samplePosts: SamplePost[] = [
  {
    id: 1,
    shopId: 1,
    categoryId: 1,
    title: "제주점 가을 객실 패키지 안내",
    publishedAt: "2026-10-20T01:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text("선선한 가을, 제주점에서 "),
        bold("오션뷰 객실 패키지"),
        text(
          "를 준비했어요. 창밖으로 바다가 보이는 객실에서 2박을 묵고, 아침은 조식으로 든든하게 시작해 보세요.",
        ),
      ),
      image("sample/jeju-ocean-room.webp", "제주점 오션뷰 객실"),
      heading("패키지 구성"),
      bulletList("오션뷰 객실 2박", "2인 조식", "렌터카 10% 할인 쿠폰"),
      paragraph(
        text(
          "예약은 프런트 전화나 카카오톡 채널로 받아요. 11월 말까지 묵는 일정에 적용돼요.",
        ),
      ),
    ),
  },
  {
    id: 2,
    shopId: 1,
    categoryId: 2,
    title: "설악점 단풍 시즌 주말 예약 팁",
    publishedAt: "2026-10-15T03:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "설악산 단풍이 절정인 10월 중순부터 11월 초까지는 주말 객실이 빨리 마감돼요. 원하는 날짜가 있다면 2주 전에는 예약해 두는 게 좋아요.",
        ),
      ),
      image("sample/seorak-maple.webp", "설악점에서 본 단풍 풍경"),
      heading("예약할 때 알아두면 좋은 점"),
      bulletList(
        "금요일 체크인이 토요일보다 여유 있어요",
        "산 쪽 객실은 단풍이 잘 보여요",
        "주차장은 오전 일찍 차요",
      ),
    ),
  },
  {
    id: 3,
    shopId: 1,
    categoryId: 3,
    title: "부산점 오션뷰 객실 리뉴얼 완료",
    publishedAt: "2026-10-08T05:00:00Z",
    // 대표 사진을 본문 첫 사진이 아닌 두 번째 사진으로 직접 고른 예시
    chosenCoverKey: "sample/busan-bathroom.webp",
    content: doc(
      paragraph(
        text(
          "부산점 오션뷰 객실 30실의 리뉴얼을 마쳤어요. 거실 가구를 새로 들이고, 욕실은 바다가 보이는 창을 넓혔어요.",
        ),
      ),
      image("sample/busan-living.webp", "리뉴얼한 객실 거실"),
      image(
        "sample/busan-bathroom.webp",
        "바다가 보이는 새 욕실 (직접 고른 대표 사진)",
      ),
      paragraph(
        text("리뉴얼 기념으로 이번 달에는 평일 숙박 요금을 15% 할인해 드려요."),
      ),
    ),
  },
  {
    id: 4,
    shopId: 1,
    categoryId: 1,
    title: "제주점 조식 메뉴가 새로워졌어요",
    publishedAt: "2026-09-28T00:30:00Z",
    chosenCoverKey: null,
    // 사진이 없는 글은 목록에 사진 없이 나온다
    content: doc(
      paragraph(
        text(
          "제주점 조식에 제주 흑돼지 덮밥과 귤 주스를 새로 넣었어요. 아이들을 위한 메뉴도 따로 준비했어요.",
        ),
      ),
      heading("조식 시간"),
      paragraph(
        text(
          "매일 아침 7시부터 10시까지예요. 주말에는 9시 전에 오시면 덜 붐벼요.",
        ),
      ),
    ),
  },
  {
    id: 5,
    shopId: 1,
    categoryId: 2,
    title: "설악점 근처 가볼 만한 산책로 3곳",
    publishedAt: "2026-09-15T02:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "설악점에서 차로 20분 안에 갈 수 있는 산책로를 골라 봤어요. 모두 아이와 함께 걷기 좋은 길이에요.",
        ),
      ),
      image("sample/seorak-trail.webp", "숲길 산책로"),
      bulletList(
        "비선대 계곡길: 왕복 1시간",
        "속초 영랑호 둘레길: 평지라 걷기 편해요",
        "외옹치 바다향기로: 바다를 따라 걸어요",
      ),
    ),
  },
  {
    id: 6,
    shopId: 2,
    categoryId: 4,
    title: "푸른들 CC 11월 그린피 할인 안내",
    publishedAt: "2026-10-21T00:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "11월 한 달 동안 푸른들 CC 평일 오후 티타임의 그린피를 20% 할인해요.",
        ),
      ),
      image("sample/cc-fairway.webp", "푸른들 CC 페어웨이"),
      bulletList("평일 12시 이후 티타임", "4인 1팀 기준", "카트비는 별도예요"),
    ),
  },
  {
    id: 7,
    shopId: 2,
    categoryId: 5,
    title: "레이크 코스 야간 라운드 오픈",
    publishedAt: "2026-10-12T09:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "푸른들 레이크에서 야간 라운드를 시작했어요. 호수 주변에 조명을 새로 달아 밤에도 공이 잘 보여요.",
        ),
      ),
      image("sample/lake-night.webp", "조명이 켜진 레이크 코스"),
      paragraph(
        text(
          "야간 라운드는 금·토요일 저녁 6시 30분 티타임부터 예약할 수 있어요.",
        ),
      ),
    ),
  },
  {
    id: 8,
    shopId: 2,
    categoryId: 6,
    title: "힐스 클럽하우스 레스토랑 새 단장",
    publishedAt: "2026-10-02T04:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "푸른들 힐스 클럽하우스 2층 레스토랑을 새로 꾸몄어요. 라운드 전후로 가볍게 드실 수 있는 메뉴를 늘렸어요.",
        ),
      ),
      image("sample/hills-restaurant.webp", "새로 꾸민 클럽하우스 레스토랑"),
    ),
  },
  {
    id: 9,
    shopId: 2,
    categoryId: 4,
    title: "처음 라운드 나가는 분들을 위한 준비물",
    publishedAt: "2026-09-20T01:00:00Z",
    chosenCoverKey: null,
    content: doc(
      paragraph(
        text(
          "골프장에 처음 가시는 분들이 자주 물어보시는 준비물을 정리했어요.",
        ),
      ),
      heading("꼭 챙길 것"),
      bulletList("골프화와 장갑", "여벌 옷과 모자", "자외선 차단제"),
      paragraph(text("클럽이 없으시면 프런트에서 하루 빌려 드려요.")),
    ),
  },
];
