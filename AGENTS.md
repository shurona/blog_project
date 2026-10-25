# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex) when working with code in this repository.

`CLAUDE.md`는 이 파일을 가리키는 심볼릭 링크다. 내용은 항상 `AGENTS.md`에서 수정한다.

아래 `nextjs-agent-rules` 블록은 `next dev`가 관리하는 내용이라 고치지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 프로젝트 개요

상점을 홍보하는 블로그 사이트다. 관리자 여러 명이 관리자 화면에서 블로그 글을 관리하고, 방문자는 사이트에 들어와 글을 구경한다. 학습용(비상업) 프로젝트다. 처음에는 펜션 블로그로 기획했다가 상점 블로그로 바꿨다.

상점 종류는 콘도, 펜션, 골프 세 가지다. 지금은 상점이 하나지만, 나중에 여러 상점으로 늘릴 수 있게 상점 단위로 나눠서 만든다. 글 주소는 `/상점주소/posts/글번호`(예: `/my-shop/posts/42`), 카테고리 주소는 `/상점주소/categories/카테고리번호` 형태다.

공유 미리보기(카카오톡 등에 링크를 보낼 때 제목과 사진이 보이게 하는 설정)와 검색 노출 설정(sitemap 등)을 넣는다.

폴더 이름(`golf-blog-project`), 저장소 이름(`shurona/blog_project`), 로컬 DB 이름(`golf_blog_local`)에 "golf"가 들어 있지만, 골프 전용이 아니라 콘도·펜션·골프 상점을 위한 블로그다.

GitHub 저장소가 공개(public)라서 커밋한 내용은 누구나 볼 수 있다.

## 스택

| 영역 | 선택 | 메모 |
|---|---|---|
| 앱 | Next.js 풀스택 | 관리자 화면과 방문자 화면을 앱 하나로 만든다. 별도 앱으로 나누지 않는다 |
| 언어 | TypeScript | |
| 스타일링 | Tailwind CSS | |
| 패키지 매니저 | pnpm | |
| 코드 검사 | ESLint (Next.js 규칙 포함) + Prettier | |
| 테스트 | Vitest | DB 없는 단위 테스트만 만든다. E2E(Playwright)는 나중에 붙인다 |
| 배포 | Vercel Hobby (무료) | 비상업 용도만 허용된다. 실제 상점 홍보에 쓰게 되면 Pro로 바꾸거나 다른 곳으로 옮겨야 한다 |
| DB | Neon (PostgreSQL 17) | 로컬도 PostgreSQL 17로 맞췄다 |
| DB 라이브러리 | Drizzle ORM | 정식 버전을 쓴다. 1.0은 베타라서 쓰지 않는다 |
| 사진 저장 | Cloudflare R2 | 버킷은 만들어 두었다. r2.dev 공개 주소는 개발용이라 속도 제한이 있다 |
| 인증 | Better Auth | 로그인과 세션만 맡긴다. 상점별 권한은 우리 테이블로 관리한다 |
| 글 에디터 | Tiptap | 글 내용은 JSON으로 저장한다(아래 구조 원칙 참고) |

상점은 코드에서 `shop`이라고 부른다. `store`는 상태 관리 용어와 헷갈려서 쓰지 않는다.

Next.js를 고른 이유는 세 가지다. 서버 렌더링이라 검색 노출에 유리하고, 무료로 배포할 수 있고, 코드 하나로 관리자 화면과 방문자 화면을 함께 관리할 수 있다.

Vercel Hobby에서 가장 먼저 걸릴 수 있는 한도는 이미지 최적화(변환) 월 5,000회다. 한도를 넘으면 과금되지는 않지만, 해당 기능이 멈추고 30일을 기다려야 다시 쓸 수 있다. 그래서 이 기능은 쓰지 않는다(아래 구조 원칙 참고).

## 구조 원칙

화면과 서버의 통신은 아래 방식 하나로 통일한다. tRPC나 화면에서 직접 부르는 API 같은 다른 방식을 섞지 않는다.

- 읽기: 서버 컴포넌트에서 DAL 함수를 불러 조회한다.
- 쓰기: 서버 액션(`'use server'`)으로 처리한다. 서버 액션은 얇게 두고 DAL 함수를 부른다.
- DB 접근은 DAL(서버 전용 모듈)에서만 한다. 로그인 확인(인증), 권한 확인(인가), 입력 검증도 DAL에서 한다. 서버 액션은 화면을 거치지 않고 직접 POST로도 호출될 수 있기 때문이다.
- 라우트 핸들러(`route.ts`)는 외부에서 부를 주소가 꼭 필요할 때만 쓴다. 인증 콜백, 웹훅 등이 해당한다.

캐시 (Cache Components)

- `next.config.ts`에서 Cache Components를 켰다. Next.js 16의 권장 기본값이다.
- 공개 데이터를 읽는 DAL 함수에는 `'use cache'`와 `cacheLife`, `cacheTag`를 붙인다. 쓰기가 끝나면 서버 액션에서 `updateTag`로 갱신한다. 로그인 정보가 필요한 읽기에는 `'use cache'`를 붙이지 않는다.
- `params`, `cookies()` 같은 요청 데이터는 `<Suspense>` 안의 컴포넌트에서 읽는다. 레이아웃이나 페이지 맨 위에서 바로 읽지 않는다.
- 주소가 잘못되면 `notFound()`로 404 화면을 보여준다. 이미 스트리밍이 시작된 뒤라 상태 코드는 200으로 나가지만, `noindex`가 붙어서 검색엔진에는 올라가지 않는다.

사진

- 서버가 발급한 업로드 주소(presigned URL)로 브라우저가 R2에 직접 올린다. Vercel 서버 함수의 요청 크기 제한(4.5MB) 때문이다.
- DB에는 전체 URL이 아니라 R2 key와 크기·종류 정보를 저장한다.
- 올리기 전에 브라우저에서 크기를 줄여 WebP로 바꾼다. 본문용은 긴 변 1920px, 목록용은 640px로 만든다. 그래서 Vercel 이미지 최적화는 쓰지 않는다.

글 내용

- Tiptap 문서(JSON)로 DB(`jsonb`)에 저장한다. HTML 문자열로 저장하지 않는다.
- 저장할 때 서버에서 검사한다. 허용한 요소만 있는지, 링크가 `http`/`https`인지, 사진이 우리 R2 key인지 확인하고, 아니면 거부한다.
- 보여줄 때는 서버에서 Tiptap 정적 렌더러로 허용한 요소만 화면으로 바꾼다. `dangerouslySetInnerHTML`은 쓰지 않는다.

글 번호

- 모든 상점이 함께 쓰는 숫자 번호다. 글을 조회할 때는 상점 주소와 글 번호를 함께 확인해서, 다른 상점 주소로는 그 글이 보이지 않게 한다.

## 기능 범위 (첫 버전)

관리자

- 전체 관리자: 상점 만들기, 관리자 계정 만들기와 권한 주기, 모든 상점 관리
- 상점 관리자: 맡은 상점의 글을 작성자와 상관없이 작성·수정·삭제한다. 작성자는 기록한다.
- 한 관리자가 여러 상점을 맡을 수 있게 관리자-상점 연결 테이블로 설계한다.
- 회원가입은 없다. 계정은 전체 관리자가 만들고, 첫 전체 관리자는 스크립트로 만든다.
- 로그인은 이메일과 비밀번호로 한다.

글

- 글쓰기 화면: 제목, 카테고리 선택, 본문(글과 사진을 넣는 에디터), 요약(선택), 대표 사진(선택)
- 카테고리는 상점 관리자가 만들고 고친다. 상위·하위 2단계까지 만들 수 있다. 지역과 브랜드 중 무엇을 위에 둘지도 상점 관리자가 정한다(예: 브랜드 > 지역).
- 글마다 카테고리 하나를 꼭 고른다. 하위 카테고리가 있는 상위 카테고리에는 글을 바로 넣지 않고 하위 카테고리를 고른다. 방문자가 상위 카테고리를 누르면 그 아래 글이 모두 보인다.
- 요약은 선택 입력이다. 비워 두면 본문 앞 120자로 만든다.
- 대표 사진은 선택 입력이다. 본문 사진 중에서 고르거나 따로 올린다. 비워 두면 본문의 첫 사진을 쓴다.
- 글 상태는 임시저장, 공개, 비공개 세 가지다. 예약 발행은 나중에 넣는다.
- 글 삭제는 확인창을 거친 뒤 소프트 삭제(휴지통)로 한다. 지운 글은 방문자에게 보이지 않는다(404).
- 휴지통 화면에서 지운 글 목록을 보고 복구할 수 있다. 복구는 그 상점의 관리자와 전체 관리자가 할 수 있다.
- 지운 글은 휴지통에 계속 남겨 둔다. 영구 삭제는 나중에 넣는다.
- 태그는 나중에 필요하면 만든다.

방문자

- 회원가입 없이 구경한다.
- 글 목록(목록형·앨범형), 글 보기, 카테고리, 검색(제목·내용), 공유(링크 복사, 카카오톡 미리보기), 조회수
- 방문자 수(Today·Total)를 하루 단위로 집계한다. 검색 로봇은 뺀다.
- 댓글과 공감은 나중에 넣는다.

상점 정보

- 상점 종류(콘도·펜션·골프)별로 따로 두는 정보는 없다. 모든 상점이 같은 칸을 쓴다.
- 사이드바 프로필: 상점 이름, 대표 사진, 짧은 소개
- 상점 소개 페이지: 소개글, 주소, 영업시간, 연락처(전화, 카카오톡 채널, 인스타그램)
- 영업시간과 연락처는 관리자 화면에서 입력받는다. 영업시간은 자유롭게 쓰는 칸이다(예: "매일 09:00~18:00, 월요일 휴무").
- 지도는 "네이버 지도에서 보기", "카카오맵에서 보기" 버튼으로 연결한다. 관리자가 지도 링크를 넣으면 그 링크를 쓰고, 비워 두면 주소로 검색하는 링크를 만든다. 페이지 안에 지도를 넣는 것(API 키 필요)은 나중에 한다.
- 첫 화면(`/`): 상점이 하나면 그 상점으로 바로 이동하고, 여러 개면 상점 목록을 보여준다.

## 테스트

DB 없는 단위 테스트만 만든다. DB를 쓰는 테스트와 E2E는 하지 않는다. PGlite는 테스트 중 메모리를 1GB 넘게 써서 쓰지 않기로 했다.

1. 입력 검증: 글 제목·내용 길이, 상점 주소 형식, 예약어(`admin`, `api` 등) 거부
2. 사진 업로드 검증: 허용 파일 종류와 최대 크기, R2 key 규칙
3. 글 내용 안전성: 스크립트, `javascript:` 링크, 우리 R2가 아닌 사진 주소 거부
4. 권한 규칙: 전체 관리자, 상점 관리자, 다른 상점 관리자, 비로그인 각각의 허용 여부
5. 표시용 변환: UTC → 한국 시간, 글 요약, 대표 사진 고르기

DB 테스트를 하지 않는 대신 이렇게 보완한다.

- 권한 판단은 DB 없이 테스트할 수 있는 함수로 만들고 4번에서 확인한다.
- 글·카테고리를 읽는 DAL 함수는 상점 조건을 빠뜨릴 수 없게 공통 함수를 거쳐 조회한다.
- DAL 기능을 만들 때마다 다른 상점 주소로 접근하면 막히는지 직접 확인한다.
- 마이그레이션은 로컬 DB(`golf_blog_local`)에 적용해 보고 확인한다.
- 나중에 DB 테스트가 필요해지면 로컬 PostgreSQL 컨테이너에 테스트용 DB를 만들어 붙인다.

## 폴더 구조

```
src/
  app/              라우팅 전용(페이지, 레이아웃). 화면을 조립만 하고 로직은 features로 보낸다
    [shop]/         방문자 화면(상점별). 주소 맨 앞이 상점 주소라서 예약어를 막는다
    admin/          관리자 화면
  features/         기능별 코드. 기능마다 폴더 하나(shops, posts, ...)
    <기능>/
      validation.ts 입력 검증 규칙(zod). 화면과 서버가 같이 쓴다
      dal.ts        DAL: DB 접근, 인증·인가, 입력 검증(server-only)
      actions.ts    서버 액션('use server'). DAL을 부르고 화면 갱신만 한다
      components/   그 기능의 화면 부품
  lib/              여러 곳에서 쓰는 작은 함수(날짜 표시, 주소의 숫자 번호 검사)
  sample/           샘플 화면용 가짜 데이터와 조회 함수. DB를 붙이면 지운다
  server/           서버 전용 공통 코드(server-only)
    auth/           Better Auth 설정. options.ts는 테이블 모양에 영향을 주는 공통 옵션, cli.ts는 테이블 정의 생성 전용
    db/             Drizzle 클라이언트(index.ts)와 테이블 정의(schema/)
    env.ts          환경 변수 검사. 비밀 값이 든 환경 변수는 여기를 통해서만 읽는다
drizzle/            drizzle-kit이 만드는 마이그레이션 SQL(git에 포함한다)
```

- `dal.ts`, `actions.ts`, `components/`는 그 기능을 만들 때 추가한다.
- 테스트 파일은 대상 파일 옆에 `*.test.ts`로 둔다.

## 로컬 개발 환경

Node.js는 nvm 기본 버전(24)을 쓴다. 환경 변수는 `.env.local`(git 제외)에 두고, 필요한 항목은 `.env.example`을 참고한다.

```bash
pnpm dev                 # 개발 서버 (http://localhost:3000)
pnpm build               # 프로덕션 빌드
pnpm lint                # ESLint
pnpm format              # Prettier로 정렬 (format:check는 검사만)
pnpm typecheck           # 주소 타입 생성(next typegen) 후 tsc

pnpm test                                          # 테스트 전체
pnpm test src/features/shops/validation.test.ts    # 파일 하나만
pnpm test -t "예약어"                              # 테스트 이름으로 골라서

pnpm auth:generate       # Better Auth 옵션 변경 → 계정 테이블 정의(schema/auth.ts) 다시 만들기
pnpm db:generate         # 스키마 변경 → 마이그레이션 SQL 생성(drizzle/)
pnpm db:migrate          # 마이그레이션을 DATABASE_URL의 DB에 적용
pnpm db:studio           # DB 내용을 브라우저로 보기
```

## DB 구조

| 테이블 | 내용 |
|---|---|
| `shops` | 상점. 주소(slug), 이름, 종류, 소개, 대표 사진, 연락처, 지도 링크 |
| `categories` | 상점별 카테고리. `parent_id`가 비어 있으면 위 단계 |
| `posts` | 글. 본문(Tiptap JSON), 본문 텍스트, 직접 입력한 요약, 직접 고른 대표 사진, 상태, 조회수, 휴지통(`deleted_at`) |
| `images` | 올린 사진의 R2 key(본문용·목록용)와 크기 정보 |
| `shop_members` | 관리자-상점 연결 |
| `user`, `session`, `account`, `verification` | Better Auth 계정·로그인. `user.is_super_admin`으로 전체 관리자를 구분한다 |

- `schema/auth.ts`는 `pnpm auth:generate`로 만드는 파일이라 직접 고치지 않는다. Better Auth 옵션(`server/auth/options.ts`)을 바꾸면 다시 만들고 `pnpm db:generate`로 마이그레이션을 만든다.
- 글의 카테고리, 글의 대표 사진, 사진이 쓰인 글, 상점의 대표 사진, 상위 카테고리는 같은 상점의 것만 연결되게 DB 제약(복합 외래 키)으로 막아 두었다. 테이블을 바꿀 때 이 제약을 지운다면 이유가 있어야 한다.
- 글이나 하위 카테고리가 있는 카테고리는 DB에서 지울 수 없다. 휴지통에 있는 글도 포함된다.
- 우리 테이블의 시각은 `timestamptz`(UTC)다. Better Auth가 만든 테이블은 시간대 없는 `timestamp`를 쓴다.
- 글 번호, 카테고리 번호 같은 ID는 integer다. 주소에서 받은 번호는 `src/lib/id-param.ts`에서 integer 범위로 거른다.

인프라 설정은 이 저장소가 아니라 `~/workspace/infra-config`에서 관리한다. DB는 여러 프로젝트가 같이 쓰는 PostgreSQL 17 컨테이너(`postgresql-17`)를 쓴다. 이 프로젝트는 그 안의 `golf_blog_local` DB만 사용한다. 같은 컨테이너의 다른 DB(`test_local` 등)는 건드리지 않는다.

```bash
# 컨테이너 실행
docker compose -f ~/workspace/infra-config/postgresql-17/docker-compose.yml up -d

# 접속 (비밀번호는 compose 파일 참고). -d를 빼면 존재하지 않는 testuser DB로 접속하려다 실패한다
psql -h 127.0.0.1 -p 55533 -U testuser -d golf_blog_local
```

포트 55532에서 도는 PostgreSQL 15 컨테이너(`database-docker-wordfinder-local-1`)는 다른 프로젝트의 것이다.

## 디자인

네이버 블로그의 레이아웃과 구성을 참고한다. 네이버 로고 같은 브랜드 요소는 쓰지 않는다.

방문자 화면은 샘플로 확인하고 확정했다.

- 위에 상점 제목, 왼쪽에 사이드바(프로필, 카테고리), 오른쪽에 본문을 둔다.
- 글 목록은 목록형과 앨범형을 버튼으로 바꿔 본다.
- 휴대폰에서는 사이드바가 본문 아래로 내려간다.

## 작업 규칙

- 모르는 요구사항은 가정하지 말고 먼저 사용자에게 묻는다. 추천은 해도 되지만, 사용자가 확인한 뒤에 진행한다.
- 코드는 AI가 작성한다. 사용자에게는 코드를 한 줄씩 설명하지 말고, 구성(폴더 구조와 각 부분의 역할)만 설명한다.
- 커밋에 Claude co-author(`Co-Authored-By: Claude`) 줄을 붙이지 않는다.

## 아직 정하지 않은 것

작업 전에 사용자에게 확인한다. 정해지면 이 목록에서 지우고 위 섹션에 반영한다.

- 디자인: 관리자 화면 스타일
- 다국어 지원 여부
