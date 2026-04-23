"use server";

import { revalidatePath } from "next/cache";

import {
  createResearchDataset,
  type SaveWorkspaceInput,
  updateResearchDataset,
} from "@/lib/research-store";

export async function createResearchAction(input: SaveWorkspaceInput) {
  const result = await createResearchDataset(input);
  revalidatePath("/");
  revalidatePath("/saved-products");

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
  revalidatePath(`/saved-products/${id}`);
  revalidatePath("/saved-products");

  return {
    ok: true,
    provider: dataset.storage.provider,
    savedAt: new Date().toISOString(),
  };
}
