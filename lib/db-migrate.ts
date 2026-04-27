import path from "node:path";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { getDb } from "@/lib/db";

declare global {
  var __profitresearch_schema_ready__: Promise<void> | undefined;
}

export async function ensureDatabaseSchema() {
  if (!globalThis.__profitresearch_schema_ready__) {
    globalThis.__profitresearch_schema_ready__ = (async () => {
      const db = getDb();
      if (!db) {
        return;
      }

      await migrate(db, {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
      });
    })().catch((error) => {
      globalThis.__profitresearch_schema_ready__ = undefined;
      throw error;
    });
  }

  await globalThis.__profitresearch_schema_ready__;
}
