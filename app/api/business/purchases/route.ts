import { requireApiUser } from "@/lib/api-auth";
import { createPurchaseOrder, listPurchaseOrders } from "@/lib/business-store";

export async function GET() {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  const purchases = await listPurchaseOrders(userId);
  return Response.json({ ok: true, purchases });
}

export async function POST(request: Request) {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  try {
    const body = (await request.json()) as {
      productId?: string;
      supplier?: string;
      status?: string;
      units?: number;
      unitCost?: number;
      shippingCost?: number;
      orderedAt?: string;
      expectedAt?: string | null;
      note?: string;
    };

    if (!body.productId) {
      return Response.json({ ok: false, error: "Product is required." }, { status: 400 });
    }

    const purchase = await createPurchaseOrder(userId, {
      productId: body.productId,
      supplier: body.supplier,
      status: body.status,
      units: body.units ?? 0,
      unitCost: body.unitCost ?? 0,
      shippingCost: body.shippingCost,
      orderedAt: body.orderedAt,
      expectedAt: body.expectedAt,
      note: body.note,
    });

    return Response.json({ ok: true, purchase }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create purchase order.",
      },
      { status: 500 },
    );
  }
}
