import { auth } from "@/lib/auth";
import { revalidateResearchWrite } from "@/lib/research-cache";
import { errorResponse, parseSaveWorkspaceInput } from "@/lib/research-http";
import { getSavedResearchById, updateResearchDataset } from "@/lib/research-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const dataset = await getSavedResearchById(userId, id);

    if (!dataset) {
      return Response.json({ ok: false, error: "Research not found" }, { status: 404 });
    }

    return Response.json({ ok: true, dataset });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const input = await parseSaveWorkspaceInput(request);
    const dataset = await updateResearchDataset(userId, id, input);

    revalidateResearchWrite(userId, id);

    return Response.json({
      ok: true,
      provider: dataset.storage.provider,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
