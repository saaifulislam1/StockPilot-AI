import {
  type Channel,
  type CompetitorEntry,
  normalizeLinks,
  normalizeProductInputs,
} from "@/lib/product-research";
import type { SaveWorkspaceInput } from "@/lib/research-store";

const CHANNELS: Channel[] = ["Website", "Facebook", "Marketplace", "Retail"];

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function channelValue(value: unknown): Channel {
  return typeof value === "string" && CHANNELS.includes(value as Channel)
    ? (value as Channel)
    : "Website";
}

function normalizeCompetitorEntry(value: unknown): CompetitorEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const productLinks = Array.isArray(value.productLinks)
    ? normalizeLinks(
        value.productLinks.filter((link): link is string => typeof link === "string"),
      )
    : normalizeLinks(
        typeof value.productUrl === "string" ? [value.productUrl] : [],
      );

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    date: stringValue(value.date, new Date().toISOString().slice(0, 10)),
    competitor: stringValue(value.competitor),
    channel: channelValue(value.channel),
    listedPrice: numberValue(value.listedPrice),
    customDeliveryFee: numberValue(value.customDeliveryFee),
    notes: stringValue(value.notes),
    productLinks,
  };
}

export async function parseSaveWorkspaceInput(
  request: Request,
): Promise<SaveWorkspaceInput> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }

  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be an object");
  }

  const competitors = Array.isArray(body.competitors)
    ? body.competitors
        .map(normalizeCompetitorEntry)
        .filter((entry): entry is CompetitorEntry => entry !== null)
    : [];
  const product = normalizeProductInputs(
    isRecord(body.product) ? body.product : {},
  );

  return {
    product,
    competitors,
    scenarioUnitsSold: numberValue(body.scenarioUnitsSold, product.unitsBought),
  };
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json(
      { ok: false, error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof Error && error.message === "Research not found") {
    return Response.json({ ok: false, error: error.message }, { status: 404 });
  }

  if (error instanceof Error && error.message === "DATABASE_URL is not configured") {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json(
    { ok: false, error: "Internal server error" },
    { status: 500 },
  );
}
