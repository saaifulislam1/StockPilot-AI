import postgres, { type Sql } from "postgres";

declare global {
  var __profitresearch_sql__: Sql | undefined;
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
