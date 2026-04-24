import { requireApiUser } from "@/lib/api-auth";
import {
  createBusinessProduct,
  listBusinessProducts,
} from "@/lib/business-store";

export async function GET() {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  const products = await listBusinessProducts(userId);
  return Response.json({ ok: true, products });
}

export async function POST(request: Request) {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      sku?: string;
      supplier?: string;
      status?: string;
      targetSellPrice?: number;
      reorderPoint?: number;
      linkedResearchId?: string | null;
      notes?: string;
    };

    if (!body.name?.trim()) {
      return Response.json({ ok: false, error: "Product name is required." }, { status: 400 });
    }

    const product = await createBusinessProduct(userId, {
      name: body.name,
      sku: body.sku,
      supplier: body.supplier,
      status: body.status,
      targetSellPrice: body.targetSellPrice,
      reorderPoint: body.reorderPoint,
      linkedResearchId: body.linkedResearchId,
      notes: body.notes,
    });

    return Response.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create product.",
      },
      { status: 500 },
    );
  }
}
