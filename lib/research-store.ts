import { getSql } from "@/lib/db";
import {
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  type SalesEntry,
  fallbackDataset,
} from "@/lib/product-research";

const WORKSPACE_ID = "default";

type WorkspaceRow = {
  product: ProductInputs;
  competitors: CompetitorEntry[];
  sales_log: SalesEntry[];
  scenario_units_sold: number;
};

export type SaveWorkspaceInput = {
  product: ProductInputs;
  competitors: CompetitorEntry[];
  scenarioUnitsSold: number;
};

async function ensureWorkspaceTable() {
  const sql = getSql();
  if (!sql) {
    return null;
  }

  await sql`
    create table if not exists product_research_workspaces (
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

async function seedWorkspace(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`
    insert into product_research_workspaces (
      id,
      product,
      competitors,
      sales_log,
      scenario_units_sold
    )
    values (
      ${WORKSPACE_ID},
      ${JSON.stringify(fallbackDataset.product)}::jsonb,
      ${JSON.stringify(fallbackDataset.competitors)}::jsonb,
      ${JSON.stringify(fallbackDataset.salesLog)}::jsonb,
      ${fallbackDataset.scenarioUnitsSold}
    )
    on conflict (id) do nothing
  `;
}

export async function loadResearchDataset(): Promise<ResearchDataset> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    return fallbackDataset;
  }

  await seedWorkspace(sql);
  const rows = (await sql`
    select
      product,
      competitors,
      sales_log,
      scenario_units_sold
    from product_research_workspaces
    where id = ${WORKSPACE_ID}
    limit 1
  `) as WorkspaceRow[];

  const row = rows[0];
  if (!row) {
    return withStorage(fallbackDataset, "neon");
  }

  return withStorage(
    {
      product: row.product,
      competitors: row.competitors ?? [],
      salesLog: row.sales_log ?? [],
      scenarioUnitsSold:
        row.scenario_units_sold > 0
          ? row.scenario_units_sold
          : fallbackDataset.scenarioUnitsSold,
    },
    "neon",
  );
}

export async function saveResearchDataset(
  input: SaveWorkspaceInput,
): Promise<ResearchDataset> {
  const sql = await ensureWorkspaceTable();
  if (!sql) {
    return {
      ...fallbackDataset,
      product: input.product,
      competitors: input.competitors,
      scenarioUnitsSold: input.scenarioUnitsSold,
    };
  }

  await sql`
    insert into product_research_workspaces (
      id,
      product,
      competitors,
      sales_log,
      scenario_units_sold
    )
    values (
      ${WORKSPACE_ID},
      ${JSON.stringify(input.product)}::jsonb,
      ${JSON.stringify(input.competitors)}::jsonb,
      ${JSON.stringify([])}::jsonb,
      ${input.scenarioUnitsSold}
    )
    on conflict (id) do update set
      product = excluded.product,
      competitors = excluded.competitors,
      scenario_units_sold = excluded.scenario_units_sold,
      updated_at = now()
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
