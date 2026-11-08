// 첫 전체 관리자를 만드는 스크립트. 두 번째 관리자부터는 관리 화면에서 만든다.
//
//   pnpm admin:create --username admin_name [--name 이름] [--email me@example.com]
//
// - 비밀번호는 실행 중에 입력한다. 입력하는 동안 화면에 보이지 않고 터미널 기록에도 남지 않는다.
//   자동 실행이 필요할 때만 ADMIN_PASSWORD 환경 변수로 넘긴다.
// - 어느 DB에 만들지는 DATABASE_URL이 정한다. 기본은 .env.local의 로컬 DB다.
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";

// 비밀번호를 입력받는다. 입력한 글자는 화면에 다시 그리지 않는다.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    // readline에는 입력을 숨기는 옵션이 없어서, 화면에 쓰는 내부 함수를 질문 문구만 쓰도록 바꾼다.
    const writable = rl as unknown as { _writeToOutput: (s: string) => void };
    writable._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function readPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const password = await promptHidden("비밀번호: ");
  const confirm = await promptHidden("비밀번호 확인: ");
  if (password !== confirm) throw new Error("비밀번호가 서로 달라요.");
  return password;
}

async function main() {
  const { values } = parseArgs({
    options: {
      username: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
    },
  });
  if (!values.username) {
    throw new Error(
      "아이디가 필요해요. 예: pnpm admin:create --username admin_name",
    );
  }

  // 서버 모듈은 불러올 때 환경 변수를 검사하므로, .env.local을 먼저 읽은 뒤에 불러온다.
  loadEnvConfig(process.cwd());
  const { auth } = await import("@/server/auth");
  const { db } = await import("@/server/db");

  try {
    const ctx = await auth.$context;
    const password = await readPassword();
    const { minPasswordLength, maxPasswordLength } = ctx.password.config;
    if (
      password.length < minPasswordLength ||
      password.length > maxPasswordLength
    ) {
      throw new Error(
        `비밀번호는 ${minPasswordLength}~${maxPasswordLength}자여야 해요.`,
      );
    }

    const username = values.username;
    // Better Auth는 계정마다 이메일이 꼭 있어야 해서, 입력하지 않으면 메일이 가지 않는 내부용 주소를 넣는다.
    const email = values.email ?? `${username.toLowerCase()}@admin.invalid`;

    // Better Auth의 가입 처리와 같은 순서로 만든다. 아이디 검사와 중복 확인은 username 플러그인이 한다.
    const hash = await ctx.password.hash(password);
    const user = await ctx.internalAdapter.createUser(
      {
        email,
        name: values.name ?? username,
        username,
        isSuperAdmin: true,
        emailVerified: false,
      },
      // 관리자가 직접 만든 계정이라는 표시. Better Auth의 관리자 기능도 같은 값을 쓴다.
      { method: "admin" },
    );
    try {
      await ctx.internalAdapter.linkAccount({
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hash,
      });
    } catch (error) {
      // 비밀번호를 연결하지 못하면 로그인할 수 없는 계정이 남으니 지운다.
      await ctx.internalAdapter.deleteUser(user.id);
      throw error;
    }

    console.log(`전체 관리자를 만들었어요: ${username}`);
  } finally {
    await db.$client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
