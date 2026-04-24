import { requireApiUser } from "@/lib/api-auth";
import { updateBusinessProduct } from "@/lib/business-store";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/business/products/[id]">,
) {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  try {
    const { id } = await context.params;
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

    const product = await updateBusinessProduct(userId, id, {
      name: body.name,
      sku: body.sku,
      supplier: body.supplier,
      status: body.status,
      targetSellPrice: body.targetSellPrice,
      reorderPoint: body.reorderPoint,
      linkedResearchId: body.linkedResearchId,
      notes: body.notes,
    });

    return Response.json({ ok: true, product });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to update product.",
      },
      { status: 500 },
    );
  }
}
