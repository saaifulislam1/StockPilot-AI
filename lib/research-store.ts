import { getSql } from "@/lib/db";
import {
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  type SalesEntry,
  computeResearchModel,
  fallbackDataset,
} from "@/lib/product-research";

type WorkspaceRow = {
  id: string;
  product: ProductInputs;
  competitors: CompetitorEntry[];
  sales_log: SalesEntry[];
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

async function ensureWorkspaceTable() {
  const sql = getSql();
  if (!sql) {
    return null;
  }

  await sql`
    create table if not exists product_researches (
      id text primary key,
      product jsonb not null,
      competitors jsonb not null default '[]'::jsonb,
      sales_log jsonb not null default '[]'::jsonb,
      scenario_units_sold integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  return sql;
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

export async function loadResearchDataset(): Promise<ResearchDataset> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    return fallbackDataset;
  }

  return withStorage(fallbackDataset, "neon");
}

function mapRowToDataset(row: WorkspaceRow): ResearchDataset {
  return withStorage(
    {
      product: row.product,
      competitors: row.competitors ?? [],
      salesLog: row.sales_log ?? [],
      scenarioUnitsSold: row.scenario_units_sold,
    },
    "neon",
  );
}

export async function createResearchDataset(
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
      product,
      competitors,
      sales_log,
      scenario_units_sold
    )
    values (
      ${id},
      ${JSON.stringify(input.product)}::jsonb,
      ${JSON.stringify(input.competitors)}::jsonb,
      ${JSON.stringify([])}::jsonb,
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
  id: string,
  input: SaveWorkspaceInput,
): Promise<ResearchDataset> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  await sql`
    update product_researches
    set
      product = ${JSON.stringify(input.product)}::jsonb,
      competitors = ${JSON.stringify(input.competitors)}::jsonb,
      scenario_units_sold = ${input.scenarioUnitsSold},
      updated_at = now()
    where id = ${id}
  `;

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

export async function listSavedResearches(): Promise<SavedResearchSummary[]> {
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
  id: string,
): Promise<ResearchDataset | null> {
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
    limit 1
  `) as WorkspaceRow[];

  const row = rows[0];
  if (!row) {
    return null;
  }

  return mapRowToDataset(row);
}
