import { revalidateResearchWrite } from "@/lib/research-cache";
import { errorResponse, parseSaveWorkspaceInput } from "@/lib/research-http";
import {
  createResearchDataset,
  listSavedResearches,
  loadResearchDataset,
} from "@/lib/research-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const view = url.searchParams.get("view");

  try {
    if (view === "default") {
      const dataset = await loadResearchDataset();
      return Response.json({ ok: true, dataset });
    }

    const items = await listSavedResearches();
    return Response.json({ ok: true, items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseSaveWorkspaceInput(request);
    const result = await createResearchDataset(input);

    revalidateResearchWrite(result.id);

    return Response.json(
      {
        ok: true,
        id: result.id,
        provider: result.dataset.storage.provider,
        savedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
