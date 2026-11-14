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

공유 미리보기(카카오톡 등에 링크를 보낼 때 제목과 사진이 보이게 하는 설정)와 검색 노출 설정(sitemap 등)을 넣는다. 이 작업은 배포 주소가 정해지고 실제 글 데이터를 연결한 뒤에 한다.

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
| 테스트 | Vitest | DB 없는 단위 테스트만 만든다. E2E는 하지 않는다 |
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
- 모든 `dal.ts`는 맨 위에 `import "server-only"`를 둔다. 로그인 정보와 권한 조회는 React `cache()`로 감싸서 한 요청 안에서 한 번만 조회한다.
- DAL은 DB 행을 그대로 돌려주지 않고, 화면에 필요한 칸만 담은 객체(DTO)를 돌려준다.
- 라우트 핸들러(`route.ts`)는 외부에서 부를 주소가 꼭 필요할 때만 쓴다. 인증 콜백, 웹훅 등이 해당한다.
- 예외: 로그인·로그아웃·비밀번호 변경 세 가지만 화면에서 Better Auth 화면용 함수(`authClient`)로 `/api/auth/...`에 보낸다. Better Auth의 로그인 시도 제한과 다른 사이트 요청 차단이 이 주소로 들어온 요청에만 걸리기 때문이다(서버 액션에서 Better Auth 함수를 직접 부르면 시도 제한을 거치지 않는다). 그 밖의 모든 데이터 쓰기는 서버 액션으로 한다.

캐시 (Cache Components)

- `next.config.ts`에서 Cache Components를 켰다. Next.js 16의 권장 기본값이다.
- 공개 데이터를 읽는 DAL 함수에는 `'use cache'`와 `cacheLife`, `cacheTag`를 붙인다. 쓰기가 끝나면 서버 액션에서 `updateTag`로 갱신한다. 로그인 정보가 필요한 읽기에는 `'use cache'`를 붙이지 않는다. 브라우저에만 캐시하는 `'use cache: private'`도 쓰지 않는다.
- `params`, `cookies()` 같은 요청 데이터는 `<Suspense>` 안의 컴포넌트에서 읽는다. 레이아웃이나 페이지 맨 위에서 바로 읽지 않는다.
- 주소가 잘못되면 `notFound()`로 404 화면을 보여준다. 이미 스트리밍이 시작된 뒤라 상태 코드는 200으로 나가지만, `noindex`가 붙어서 검색엔진에는 올라가지 않는다.

사진

- 서버가 발급한 업로드 주소(presigned URL)로 브라우저가 R2에 직접 올린다. Vercel 서버 함수의 요청 크기 제한(4.5MB) 때문이다.
- DB에는 전체 URL이 아니라 R2 key와 크기·종류 정보를 저장한다.
- 올리기 전에 브라우저에서 크기를 줄여 WebP로 바꾼다. 본문용은 긴 변 1920px, 목록용은 640px로 만든다. 그래서 Vercel 이미지 최적화는 쓰지 않는다.
- 화면에는 Next.js `<Image>` 컴포넌트로 보여준다. `next.config.ts`에서 `images.unoptimized`를 켜 두어 Vercel을 거치지 않고 R2에서 바로 불러온다. 화면이 덜컹거리지 않게 가로·세로 크기를 꼭 넣는다.

기능을 만들 때 지킬 것

- 글쓰기 에디터(Tiptap)는 무거워서 관리자 화면에서 `next/dynamic`으로 필요할 때만 불러온다.
- 조회수와 방문자 수는 응답을 보낸 뒤 `after()`로 집계해서 화면을 늦추지 않는다. 검색 로봇은 `userAgent().isBot`으로 거른다.

오류 화면

- `app/error.tsx`: 예상하지 못한 오류가 나면 보여준다.
- `app/[shop]/error.tsx`: 상점 페이지 오류. 상점 제목과 사이드바는 그대로 두고 본문 자리에만 보여준다.
- `app/global-error.tsx`: 최상위 레이아웃 오류. 전역 CSS가 적용되지 않아 스타일을 직접 적는다.
- `app/admin/error.tsx`: 관리자 페이지 오류.

관리자 페이지 보호

- 주소: `/admin/login`(로그인), `/admin/change-password`(비밀번호 변경), 그 밖의 관리 화면은 `app/admin/(dashboard)/` 아래에 두어 왼쪽 메뉴 레이아웃을 함께 쓴다.
- 상점 관리 주소: `/admin/shops`(맡은 상점 목록), `/admin/shops/new`(상점 만들기, 전체 관리자만), `/admin/shops/상점주소/...`(상점별 관리. 상점 정보·카테고리·글·휴지통을 탭으로 나눈다). 상점이 주소에 들어 있어서 어느 상점을 관리하는 중인지 늘 분명하다.
- 관리할 수 없는 상점 주소로 들어오면 상점이 없을 때와 똑같이 404를 보여준다. 권한 없는 사람에게 상점이 있는지도 알려주지 않기 위해서다.
- 1차: `src/proxy.ts`가 로그인 쿠키가 없으면 페이지를 그리기 전에 `/admin/login`으로 보낸다. 쿠키가 있는지만 본다.
- 2차: 관리 화면은 `requireAdmin()`(`features/auth/dal.ts`)으로 세션을 확인한다. 로그인하지 않았으면 로그인 화면으로, 임시 비밀번호를 아직 바꾸지 않았으면 비밀번호 변경 화면으로 보낸다.
- 3차: 데이터를 읽고 쓰는 DAL 함수마다 `requireAdmin()`과 `features/auth/permissions.ts`의 권한 판단을 다시 거친다.
- `user.must_change_password`는 화면에서 바꿀 수 없다. 비밀번호 변경이 성공하면 Better Auth after 훅(`server/auth/index.ts`)이 지운다.
- 관리자 페이지에는 `noindex`가 붙는다(`app/admin/layout.tsx`).
- 배포한 뒤 확인할 것: 로그인 시도 기록(`rate_limit.key`)이 접속자 IP별로 나뉘는지 본다. 로컬에서는 IP를 알 수 없어서 모두 같은 키로 기록된다.

글 내용

- Tiptap 문서(JSON)로 DB(`jsonb`)에 저장한다. HTML 문자열로 저장하지 않는다.
- 저장할 때 서버에서 검사한다. 허용한 요소만 있는지, 링크가 `http`/`https`인지, 사진이 우리 R2 key인지 확인하고, 아니면 거부한다.
- 보여줄 때는 서버에서 Tiptap 정적 렌더러로 허용한 요소만 화면으로 바꾼다. `dangerouslySetInnerHTML`은 쓰지 않는다.

보안 헤더

- 배포 전에 CSP(Content Security Policy)를 `next.config.ts`의 `headers()`로 넣는다. 요청마다 값을 새로 만드는 nonce 방식은 모든 페이지를 매번 새로 그려야 해서, 미리 만들어 두는 화면(Cache Components)과 맞지 않아 쓰지 않는다.

글 번호

- 모든 상점이 함께 쓰는 숫자 번호다. 글을 조회할 때는 상점 주소와 글 번호를 함께 확인해서, 다른 상점 주소로는 그 글이 보이지 않게 한다.

## 기능 범위 (첫 버전)

관리자

- 전체 관리자: 상점 만들기, 관리자 계정 만들기와 권한 주기, 모든 상점 관리
- 상점 관리자: 맡은 상점의 글을 작성자와 상관없이 작성·수정·삭제한다. 작성자는 기록한다. 맡은 상점의 정보(이름, 소개, 연락처, 영업시간 등)도 고칠 수 있다. 상점 만들기는 전체 관리자만 한다.
- 한 관리자가 여러 상점을 맡을 수 있게 관리자-상점 연결 테이블로 설계한다.
- 회원가입은 없다. 계정은 전체 관리자가 만들고, 첫 전체 관리자는 스크립트로 만든다.
- 전체 관리자는 임시 비밀번호로 계정을 만들어 전달하고, 받은 사람은 첫 로그인 때 비밀번호를 바꾼다. 메일 발송 서비스는 쓰지 않는다.
- 로그인은 아이디와 비밀번호로 한다(Better Auth username 플러그인). 로그인 주소는 `/admin/login`이다.
- 아이디는 영문·숫자·밑줄(`_`)·점(`.`)으로 3~30자이고, 소문자로 바꿔 저장한다.
- 이메일은 로그인에 쓰지 않는 별도 정보다. Better Auth는 계정마다 이메일이 꼭 있어야 해서, 입력하지 않으면 메일이 가지 않는 내부용 주소(`아이디@admin.invalid`)를 넣는다. 화면에서는 이 주소를 "이메일 없음"으로 보여준다.
- 비밀번호는 10자 이상이다. Better Auth가 scrypt(무작위 소금값 포함)로 해시해서 `account.password`에 저장하고, 원래 비밀번호는 어디에도 저장하지 않는다.
- 로그인 시도 제한: 운영 환경에서 로그인 요청은 10초에 3번까지다(Better Auth 기본 규칙). 기록은 서버가 여러 대여도 공유되도록 DB(`rate_limit`)에 저장한다.
- 로그인 세션은 쿠키(HttpOnly)로 7일 유지된다.
- 첫 전체 관리자는 `pnpm admin:create`로 만든다. DB가 다르면(로컬, 운영) 환경마다 한 번씩 만든다.

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
- 상점은 전체 관리자만 만든다. 상점 주소(slug)는 만들 때 정하고 바꿀 수 없다. 이미 공유된 링크가 깨지지 않게 하기 위해서다. `new`처럼 관리 화면 주소와 겹치는 단어도 예약어로 막는다.
- 첫 버전에는 상점 삭제가 없다.
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
    auth/           관리자 로그인. dal.ts(getCurrentAdmin, requireAdmin), permissions.ts(권한 판단), auth-client.ts(화면용 인증 함수)
    admin/          관리 화면 공통 부품(왼쪽 메뉴)
  lib/              여러 곳에서 쓰는 작은 함수(날짜 표시, 주소의 숫자 번호 검사, 서버 액션 결과 형식)
  proxy.ts          로그인 쿠키가 없으면 /admin을 그리기 전에 로그인 화면으로 보낸다
  sample/           샘플 화면용 가짜 데이터와 조회 함수. DB를 붙이면 지운다
  server/           서버 전용 공통 코드(server-only)
    auth/           Better Auth 설정. index.ts는 앱에서 쓰는 실제 설정, options.ts는 테이블 모양에 영향을 주는 공통 옵션, cli.ts는 테이블 정의 생성 전용
    db/             Drizzle 클라이언트(index.ts)와 테이블 정의(schema/)
    env.ts          환경 변수 검사. 비밀 값이 든 환경 변수는 여기를 통해서만 읽는다
drizzle/            drizzle-kit이 만드는 마이그레이션 SQL(git에 포함한다)
scripts/            터미널에서 실행하는 스크립트(첫 전체 관리자 만들기 등). server-only 파일을 쓰려고 `tsx --conditions=react-server`로 실행한다
```

- `dal.ts`, `actions.ts`, `components/`는 그 기능을 만들 때 추가한다.
- 테스트 파일은 대상 파일 옆에 `*.test.ts`로 둔다.

## 로컬 개발 환경

Node.js는 nvm 기본 버전(24)을 쓴다. 환경 변수는 `.env.local`(git 제외)에 두고, 필요한 항목은 `.env.example`을 참고한다. 지금 쓰는 값은 `DATABASE_URL`, `BETTER_AUTH_SECRET`(`openssl rand -base64 32`로 만든 무작위 값), `BETTER_AUTH_URL`이다. 운영 환경에는 로컬과 다른 비밀 키를 쓴다.

```bash
pnpm dev                 # 개발 서버 (http://localhost:3000)
pnpm build               # 프로덕션 빌드
pnpm lint                # ESLint
pnpm format              # Prettier로 정렬 (format:check는 검사만)
pnpm typecheck           # 주소 타입 생성(next typegen) 후 tsc

pnpm test                                          # 테스트 전체
pnpm test src/features/shops/validation.test.ts    # 파일 하나만
pnpm test -t "예약어"                              # 테스트 이름으로 골라서

pnpm admin:create --username 아이디 [--name 이름] [--email 메일]   # 전체 관리자 만들기. 비밀번호는 실행 중 입력
pnpm auth:generate       # Better Auth 옵션 변경 → 계정 테이블 정의(schema/auth.ts) 다시 만들고 정렬
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
| `user`, `session`, `account`, `verification` | Better Auth 계정·로그인. `user.username`이 로그인 아이디, `user.is_super_admin`이 전체 관리자 여부, `user.must_change_password`가 첫 로그인 비밀번호 변경 필요 여부다 |
| `rate_limit` | Better Auth 로그인 시도 기록 |

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

관리자 화면은 네이버 블로그 스타일이 아니라, 왼쪽 메뉴가 있는 일반적인 관리 화면(대시보드)으로 한다.

## 코드 컨벤션

도구가 자동으로 지키게 한 것

- Prettier: 큰따옴표, 세미콜론, 2칸 들여쓰기, 한 줄 80자. Tailwind 클래스 순서와 import 순서도 자동으로 정렬한다.
- import 순서: 바깥 패키지 → `@/` 경로 → 같은 폴더(`./`, `../`). 묶음 사이에는 빈 줄을 둔다.
- ESLint: Next.js 권장 규칙(core-web-vitals)과 TypeScript 규칙. TypeScript는 `strict` 모드다.

이름과 작성 규칙

| 대상 | 규칙 | 예 |
|---|---|---|
| 파일 이름 | 소문자와 하이픈 | `post-list.tsx`, `id-param.ts` |
| 컴포넌트 | 대문자로 시작, 이름 붙여 내보낸다. Next.js의 `page`·`layout` 같은 파일만 `default`로 내보낸다 | `export function PostList` |
| 함수·변수 | 소문자로 시작 | `findShop`, `makeSummary` |
| 상수 | 대문자와 밑줄 | `SHOP_TYPES` |
| 타입 | `interface` 대신 `type` | `type PostListItem = {...}` |
| 가져오기 | `@/` 별칭. drizzle-kit이 직접 읽는 DB 스키마 파일만 상대 경로 | `@/features/posts/types` |
| DB 칸 이름 | 코드는 `camelCase`, DB는 `snake_case`로 이름을 직접 적는다 | `plainText: text("plain_text")` |

- 주석과 테스트 이름은 한국어로 쓴다. 코드가 무엇을 하는지보다 왜 그렇게 하는지를 적는다.
- 입력 검증은 zod로 한다.
- 링크 주소는 타입 검사한다(`typedRoutes`). 변수로 만든 주소는 `as Route`를 붙인다. 예: `` `/${shopSlug}/posts/${id}` as Route ``
- 서버 액션의 결과: 입력 오류처럼 예상할 수 있는 실패는 `{ ok: false, error, fieldErrors, values }`로 돌려주고 폼에 메시지로 보여준다. `fieldErrors`는 칸별 오류, `values`는 사용자가 넣었던 값이라 폼이 입력을 잃지 않는다. 성공은 `{ ok: true, ... }`다. 형식과 도우미 함수는 `src/lib/action-result.ts`에 있다. 권한이 없는 요청처럼 화면에서는 생길 수 없는 오류는 던져서 오류 화면(`error.tsx`)으로 보낸다.
- 칸별 오류 메시지는 그 칸 바로 아래에 보이므로 칸 이름을 넣지 않는다(예: "200자까지 쓸 수 있어요.").

git

- 커밋 메시지는 머리말 + 한국어 설명으로 쓴다(Conventional Commits). 머리말: `feat`(기능), `fix`(버그 수정), `refactor`(동작이 같은 코드 정리), `docs`(문서), `test`(테스트), `chore`(설정·의존성). 예: `feat: 관리자 로그인 화면 추가`
- 1차 완성 전까지는 `main` 브랜치에 바로 커밋한다.

## 작업 규칙

- 모르는 요구사항은 가정하지 말고 먼저 사용자에게 묻는다. 추천은 해도 되지만, 사용자가 확인한 뒤에 진행한다.
- 코드는 AI가 작성한다. 사용자에게는 코드를 한 줄씩 설명하지 말고, 구성(폴더 구조와 각 부분의 역할)만 설명한다.
- 커밋에 Claude co-author(`Co-Authored-By: Claude`) 줄을 붙이지 않는다.

## 아직 정하지 않은 것

작업 전에 사용자에게 확인한다. 정해지면 이 목록에서 지우고 위 섹션에 반영한다.

- 다국어 지원 여부
- 구조화 데이터(JSON-LD)를 넣을지: 검색 노출 작업을 할 때 정한다. 넣는다면 `dangerouslySetInnerHTML` 금지 규칙에 이 한 곳만 예외를 둔다
