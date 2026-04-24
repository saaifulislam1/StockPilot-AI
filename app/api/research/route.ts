import { auth } from "@/lib/auth";
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
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (view === "default") {
      const dataset = await loadResearchDataset();
      return Response.json({ ok: true, dataset });
    }

    const items = await listSavedResearches(userId);
    return Response.json({ ok: true, items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const input = await parseSaveWorkspaceInput(request);
    const result = await createResearchDataset(userId, input);

    revalidateResearchWrite(userId, result.id);

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
