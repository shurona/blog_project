import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Next.js와 같은 규칙으로 .env.local 등을 읽는다.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL이 없어요. .env.local을 확인하세요.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
});
