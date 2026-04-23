"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  createResearchDataset,
  type SaveWorkspaceInput,
  updateResearchDataset,
} from "@/lib/research-store";

const SAVED_RESEARCHES_TAG = "saved-researches";

function savedResearchTag(id: string) {
  return `saved-research:${id}`;
}

export async function createResearchAction(input: SaveWorkspaceInput) {
  const result = await createResearchDataset(input);
  updateTag(SAVED_RESEARCHES_TAG);
  updateTag(savedResearchTag(result.id));
  revalidatePath("/saved-products");
  revalidatePath(`/saved-products/${result.id}`);

  return {
    ok: true,
    id: result.id,
    provider: result.dataset.storage.provider,
    savedAt: new Date().toISOString(),
  };
}

export async function updateResearchAction(
  id: string,
  input: SaveWorkspaceInput,
) {
  const dataset = await updateResearchDataset(id, input);
  updateTag(SAVED_RESEARCHES_TAG);
  updateTag(savedResearchTag(id));
  revalidatePath(`/saved-products/${id}`);
  revalidatePath("/saved-products");

  return {
    ok: true,
    provider: dataset.storage.provider,
    savedAt: new Date().toISOString(),
  };
}
