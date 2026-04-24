import { requireApiUser } from "@/lib/api-auth";
import { createSalesLog, listSalesLogs } from "@/lib/business-store";

export async function GET() {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  const sales = await listSalesLogs(userId);
  return Response.json({ ok: true, sales });
}

export async function POST(request: Request) {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  try {
    const body = (await request.json()) as {
      productId?: string;
      channel?: string;
      status?: string;
      quantity?: number;
      sellPrice?: number;
      deliveryCost?: number;
      adSpend?: number;
      packagingCost?: number;
      platformFee?: number;
      soldAt?: string;
      note?: string;
    };

    if (!body.productId) {
      return Response.json({ ok: false, error: "Product is required." }, { status: 400 });
    }

    const sale = await createSalesLog(userId, {
      productId: body.productId,
      channel: body.channel,
      status: body.status,
      quantity: body.quantity ?? 0,
      sellPrice: body.sellPrice ?? 0,
      deliveryCost: body.deliveryCost,
      adSpend: body.adSpend,
      packagingCost: body.packagingCost,
      platformFee: body.platformFee,
      soldAt: body.soldAt,
      note: body.note,
    });

    return Response.json({ ok: true, sale }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create sales log.",
      },
      { status: 500 },
    );
  }
}
