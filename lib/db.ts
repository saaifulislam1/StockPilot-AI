import postgres, { type Sql } from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/db/schema";

declare global {
  var __profitresearch_sql__: Sql | undefined;
  var __profitresearch_drizzle__: PostgresJsDatabase<typeof schema> | undefined;
}

function createSqlClient(databaseUrl: string) {
  return postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl:
      databaseUrl.includes("sslmode=require") || databaseUrl.includes("ssl=true")
        ? "require"
        : undefined,
  });
}

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  if (!globalThis.__profitresearch_sql__) {
    globalThis.__profitresearch_sql__ = createSqlClient(databaseUrl);
  }

  return globalThis.__profitresearch_sql__;
}

export function getDb() {
  const client = getSql();
  if (!client) {
    return null;
  }

  if (!globalThis.__profitresearch_drizzle__) {
    globalThis.__profitresearch_drizzle__ = drizzle(client, { schema });
  }

  return globalThis.__profitresearch_drizzle__;
}

export { schema };
