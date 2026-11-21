# syntax=docker/dockerfile:1

# 운영 서버에서 돌릴 앱 이미지. 서버가 약해서 서버에서는 빌드하지 않고,
# 여기서 만든 이미지를 받아 실행만 한다.

# 로컬 개발과 같은 Node 24를 쓴다.
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# pnpm 버전은 package.json의 packageManager를 따른다.
RUN corepack enable
WORKDIR /app

# 1단계: 의존성 설치. package.json과 lock 파일이 그대로면 이 단계는 다시 돌지 않는다.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 2단계: 빌드
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# server/env.ts는 값이 없으면 바로 실패하므로, 형식만 맞춘 가짜 값으로 빌드한다.
# 가짜 값은 이 명령에서만 쓰이고 이미지에 남지 않는다. 진짜 값은 컨테이너를 띄울 때 넣는다.
RUN DATABASE_URL="postgresql://build:build@build.invalid:5432/build" \
    BETTER_AUTH_SECRET="build-only-placeholder-not-a-real-secret" \
    BETTER_AUTH_URL="http://build.invalid" \
    R2_ACCOUNT_ID="build" \
    R2_ACCESS_KEY_ID="build" \
    R2_SECRET_ACCESS_KEY="build" \
    R2_BUCKET_NAME="build" \
    R2_PUBLIC_URL="https://build.invalid" \
    pnpm build

# 3단계: 실행. 빌드 결과 중 실행에 필요한 파일(.next/standalone)만 담는다.
FROM node:24-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 컨테이너 밖에서 접속할 수 있게 모든 주소에서 듣는다.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
# standalone에는 화면용 정적 파일이 빠져 있어서 따로 넣는다.
# public 폴더를 만들게 되면 그 폴더도 여기서 복사해야 한다.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# root가 아닌 계정으로 실행한다.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
