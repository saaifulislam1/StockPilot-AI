import { revalidateResearchWrite } from "@/lib/research-cache";
import { errorResponse, parseSaveWorkspaceInput } from "@/lib/research-http";
import { getSavedResearchById, updateResearchDataset } from "@/lib/research-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const dataset = await getSavedResearchById(id);

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
    const { id } = await context.params;
    const input = await parseSaveWorkspaceInput(request);
    const dataset = await updateResearchDataset(id, input);

    revalidateResearchWrite(id);

    return Response.json({
      ok: true,
      provider: dataset.storage.provider,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
