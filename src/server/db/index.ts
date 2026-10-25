import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/server/env";
import * as schema from "./schema";

// 개발 중에는 코드를 고칠 때마다 모듈이 다시 불러와지므로, 연결 풀을 하나만 만들어 재사용한다.
const globalForDb = globalThis as unknown as { pgPool?: Pool };
const pool =
  globalForDb.pgPool ?? new Pool({ connectionString: env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle({ client: pool, schema });
