import { getSql } from "@/lib/db";
import { ensureDatabaseSchema } from "@/lib/db-migrate";
import { cacheLife, cacheTag } from "next/cache";
import { ensureAuthTables } from "@/lib/auth-store";
import {
  savedResearchesTag,
  savedResearchTag,
} from "@/lib/research-cache";
import {
  type CompetitorEntry,
  type Channel,
  type ProductInputs,
  type ResearchDataset,
  type SalesEntry,
  computeResearchModel,
  fallbackDataset,
  normalizeProductInputs,
} from "@/lib/product-research";

type WorkspaceRow = {
  id: string;
  product: ProductInputs | string | null;
  competitors: CompetitorEntry[] | string | null;
  sales_log: SalesEntry[] | string | null;
  scenario_units_sold: number;
  created_at: string;
  updated_at: string;
};

export type SaveWorkspaceInput = {
  product: ProductInputs;
  competitors: CompetitorEntry[];
  scenarioUnitsSold: number;
};

export type SavedResearchSummary = {
  id: string;
  productName: string;
  supplier: string;
  competitorCount: number;
  recommendedSellPrice: number;
  updatedAt: string;
};

let workspaceTablePromise: Promise<ReturnType<typeof getSql>> | null = null;

async function initWorkspaceTable() {
  await ensureDatabaseSchema();

  const sql = getSql();
  if (!sql) {
    return null;
  }

  await ensureAuthTables();

  return sql;
}

async function ensureWorkspaceTable() {
  if (!workspaceTablePromise) {
    workspaceTablePromise = initWorkspaceTable();
  }

  return workspaceTablePromise;
}

function withStorage(
  dataset: Omit<ResearchDataset, "storage">,
  provider: "neon" | "local",
): ResearchDataset {
  return {
    ...dataset,
    storage: {
      provider,
    },
  };
}

function parseJsonArray<T>(value: T[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function parseJsonObject<T extends object>(value: T | string | null | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch {
      return {} as T;
    }
  }

  return {} as T;
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function channelValue(value: unknown): Channel {
  return value === "Facebook" ||
    value === "Marketplace" ||
    value === "Retail" ||
    value === "Website"
    ? value
    : "Website";
}

function normalizeStoredCompetitors(value: CompetitorEntry[] | string | null) {
  return parseJsonArray<Record<string, unknown>>(value).map((entry) => ({
    id: typeof entry.id === "string" ? entry.id : undefined,
    date: stringValue(entry.date, new Date().toISOString().slice(0, 10)),
    competitor: stringValue(entry.competitor),
    productLinks: Array.isArray(entry.productLinks)
      ? entry.productLinks.filter((link): link is string => typeof link === "string")
      : typeof entry.productUrl === "string"
        ? [entry.productUrl]
        : [],
    productUrl: stringValue(entry.productUrl),
    channel: channelValue(entry.channel),
    listedPrice: numberValue(entry.listedPrice),
    customDeliveryFee: numberValue(entry.customDeliveryFee),
    notes: stringValue(entry.notes),
  }));
}

export async function loadResearchDataset(): Promise<ResearchDataset> {
  const sql = getSql();
  if (!sql) {
    return fallbackDataset;
  }

  return withStorage(fallbackDataset, "neon");
}

function mapRowToDataset(row: WorkspaceRow): ResearchDataset {
  return withStorage(
    {
      product: normalizeProductInputs(parseJsonObject<ProductInputs>(row.product)),
      competitors: normalizeStoredCompetitors(row.competitors),
      salesLog: parseJsonArray<SalesEntry>(row.sales_log),
      scenarioUnitsSold: row.scenario_units_sold,
    },
    "neon",
  );
}

export async function createResearchDataset(
  userId: string,
  input: SaveWorkspaceInput,
): Promise<{ id: string; dataset: ResearchDataset }> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const id = crypto.randomUUID();

  await sql`
    insert into product_researches (
      id,
      user_id,
      product,
      competitors,
      sales_log,
      scenario_units_sold
    )
    values (
      ${id},
      ${userId},
      ${sql.json(input.product)}::jsonb,
      ${sql.json(input.competitors)}::jsonb,
      ${sql.json([])}::jsonb,
      ${input.scenarioUnitsSold}
    )
  `;

  return {
    id,
    dataset: withStorage(
      {
        product: input.product,
        competitors: input.competitors,
        salesLog: [],
        scenarioUnitsSold: input.scenarioUnitsSold,
      },
      "neon",
    ),
  };
}

export async function updateResearchDataset(
  userId: string,
  id: string,
  input: SaveWorkspaceInput,
): Promise<ResearchDataset> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const rows = await sql`
    update product_researches
    set
      product = ${sql.json(input.product)}::jsonb,
      competitors = ${sql.json(input.competitors)}::jsonb,
      scenario_units_sold = ${input.scenarioUnitsSold},
      updated_at = now()
    where id = ${id}
      and user_id = ${userId}
    returning id
  `;

  if (rows.length === 0) {
    throw new Error("Research not found");
  }

  return withStorage(
    {
      product: input.product,
      competitors: input.competitors,
      salesLog: [],
      scenarioUnitsSold: input.scenarioUnitsSold,
    },
    "neon",
  );
}

export async function listSavedResearches(
  userId: string,
): Promise<SavedResearchSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(savedResearchesTag(userId));

  const sql = await ensureWorkspaceTable();
  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      id,
      product,
      competitors,
      sales_log,
      scenario_units_sold,
      created_at::text,
      updated_at::text
    from product_researches
    where user_id = ${userId}
    order by updated_at desc
  `) as WorkspaceRow[];

  return rows.map((row) => {
    const dataset = mapRowToDataset(row);
    const model = computeResearchModel(dataset, dataset.scenarioUnitsSold);

    return {
      id: row.id,
      productName: dataset.product.productName,
      supplier: dataset.product.supplier,
      competitorCount: dataset.competitors.filter((entry) => entry.listedPrice > 0)
        .length,
      recommendedSellPrice: model.pricing.recommendedSellPrice,
      updatedAt: row.updated_at,
    };
  });
}

export async function getSavedResearchById(
  userId: string,
  id: string,
): Promise<ResearchDataset | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(savedResearchesTag(userId), savedResearchTag(userId, id));

  const sql = await ensureWorkspaceTable();
  if (!sql) {
    return null;
  }

  const rows = (await sql`
    select
      id,
      product,
      competitors,
      sales_log,
      scenario_units_sold,
      created_at::text,
      updated_at::text
    from product_researches
    where id = ${id}
      and user_id = ${userId}
    limit 1
  `) as WorkspaceRow[];

  const row = rows[0];
  if (!row) {
    return null;
  }

  return mapRowToDataset(row);
}
