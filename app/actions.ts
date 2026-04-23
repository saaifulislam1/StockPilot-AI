"use server";

import { revalidatePath } from "next/cache";

import {
  saveResearchDataset,
  type SaveWorkspaceInput,
} from "@/lib/research-store";

export async function saveWorkspaceAction(input: SaveWorkspaceInput) {
  const dataset = await saveResearchDataset(input);
  revalidatePath("/");

  return {
    ok: true,
    provider: dataset.storage.provider,
    savedAt: new Date().toISOString(),
  };
}
