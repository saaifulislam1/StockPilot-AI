import { requireApiUser } from "@/lib/api-auth";
import {
  createInventoryAdjustment,
  listInventoryAdjustments,
} from "@/lib/business-store";

export async function GET() {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  const adjustments = await listInventoryAdjustments(userId);
  return Response.json({ ok: true, adjustments });
}

export async function POST(request: Request) {
  const { userId, response } = await requireApiUser();
  if (!userId) {
    return response!;
  }

  try {
    const body = (await request.json()) as {
      productId?: string;
      deltaUnits?: number;
      reason?: string;
      note?: string;
    };

    if (!body.productId) {
      return Response.json({ ok: false, error: "Product is required." }, { status: 400 });
    }

    if (!body.reason?.trim()) {
      return Response.json({ ok: false, error: "Reason is required." }, { status: 400 });
    }

    const adjustment = await createInventoryAdjustment(userId, {
      productId: body.productId,
      deltaUnits: body.deltaUnits ?? 0,
      reason: body.reason,
      note: body.note,
    });

    return Response.json({ ok: true, adjustment }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create inventory adjustment.",
      },
      { status: 500 },
    );
  }
}
